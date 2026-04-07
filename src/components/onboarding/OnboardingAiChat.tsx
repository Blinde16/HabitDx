import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../stores/authStore';
import { AuthButton } from '../auth';
import {
  sendOnboardingCoachMessage,
  finalizeOnboardingFromTranscript,
  mapExtractedToOnboardingData,
  type ChatTurn,
} from '../../lib/onboardingAiService';
import { track } from '../../lib/analytics';
import { useWebSpeechRecognition } from '../../hooks/useWebSpeechRecognition';

const WELCOME =
  "Hi — I'm your HabitDx guide. I want to hear your story in your own words: habits you've tried, what happens when things slip, and what a good week would look like for you.\n\nWhat's been on your mind lately when it comes to habits or routines?";

function Bubble({ role, children }: { role: 'user' | 'assistant'; children: React.ReactNode }) {
  const isUser = role === 'user';
  return (
    <View className={`mb-3 max-w-[92%] ${isUser ? 'self-end' : 'self-start'}`}>
      {!isUser && (
        <View className="self-start bg-primary_container rounded-full px-3 py-1 mb-1.5">
          <Text className="text-[10px] font-semibold uppercase tracking-[1px] text-white">
            HabitDx
          </Text>
        </View>
      )}
      <View
        className={`rounded-[20px] px-4 py-3 ${
          isUser ? 'bg-surface_brand rounded-tr-sm' : 'bg-primary_container rounded-tl-sm'
        }`}
      >
        <Text className={`text-base font-public leading-6 ${isUser ? 'text-on_surface' : 'text-white'}`}>
          {children}
        </Text>
      </View>
    </View>
  );
}

export function OnboardingAiChat() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { applyAiExtracted, submitOnboarding, loading: storeLoading } = useOnboardingStore();
  const { user } = useAuthStore();
  const {
    listening,
    supported: speechSupported,
    startListening,
    stopListening,
  } = useWebSpeechRecognition();

  const [messages, setMessages] = useState<ChatTurn[]>([{ role: 'assistant', content: WELCOME }]);
  const [input, setInput] = useState('');
  const [coachLoading, setCoachLoading] = useState(false);
  const [finalizeLoading, setFinalizeLoading] = useState(false);

  const userTurnCount = messages.filter((m) => m.role === 'user').length;
  const canFinalize = userTurnCount >= 3 && !coachLoading && !finalizeLoading;

  const scrollBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  useEffect(() => {
    scrollBottom();
  }, [messages, coachLoading, scrollBottom]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || coachLoading) return;

    const before = messages;
    const next: ChatTurn[] = [...before, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setCoachLoading(true);
    void track('onboarding_ai_user_message', { length: text.length });

    try {
      const reply = await sendOnboardingCoachMessage(next);
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert('Could not reach coach', msg);
      setMessages(before);
    } finally {
      setCoachLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!user || !canFinalize) return;

    setFinalizeLoading(true);
    try {
      const raw = await finalizeOnboardingFromTranscript(messages);
      const data = mapExtractedToOnboardingData(raw);
      applyAiExtracted(data);
      void track('onboarding_ai_finalize', { userTurns: userTurnCount });
      await submitOnboarding(user.id);
      router.push('/(onboarding)/failure-profile' as never);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert('Could not build profile', msg);
    } finally {
      setFinalizeLoading(false);
    }
  };

  const handleMic = () => {
    if (listening) {
      stopListening();
      return;
    }
    startListening((text) => {
      setInput((prev) => (prev ? `${prev} ${text}` : text));
    });
  };

  const handleSkip = () => {
    router.replace('/(tabs)/home');
  };

  const main = (
    <ScrollView
      ref={scrollRef}
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full max-w-lg self-center">
        <Text className="text-xs font-public text-on_surface_variant mb-4 text-center">
          AI conversation — speak or type. We use this only to personalize your plan.
        </Text>
        {messages.map((m, i) => (
          <Bubble key={`${i}-${m.role}-${m.content.slice(0, 12)}`} role={m.role}>
            {m.content}
          </Bubble>
        ))}
        {coachLoading && (
          <View className="self-start flex-row items-center gap-2 mb-4">
            <ActivityIndicator size="small" color="#191c1e" />
            <Text className="text-on_surface_variant font-public text-sm">Thinking…</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const footer = (
    <View className="bg-surface px-4 py-3">
      <View className="w-full max-w-lg self-center gap-3">
        <View className="flex-row items-end gap-2">
          {Platform.OS === 'web' && speechSupported && (
            <TouchableOpacity
              onPress={handleMic}
              className={`h-12 w-12 rounded-2xl items-center justify-center border ${
                listening
                  ? 'bg-surface_brand border-accent'
                  : 'bg-surface_brand_muted border-ghost_border'
              }`}
              accessibilityLabel={listening ? 'Stop recording' : 'Speak your reply'}
            >
              <Text className="text-xl">{listening ? '■' : '🎤'}</Text>
            </TouchableOpacity>
          )}
          <TextInput
            className="flex-1 min-h-[48px] max-h-[120px] border border-ghost_border rounded-2xl px-4 py-3 text-base text-on_surface bg-surface_brand_muted"
            placeholder="Type your reply…"
            placeholderTextColor="#94a3b8"
            value={input}
            onChangeText={setInput}
            multiline
            editable={!coachLoading && !finalizeLoading}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim() || coachLoading}
            className={`h-12 px-4 rounded-2xl items-center justify-center bg-primary_container ${
              !input.trim() || coachLoading ? 'opacity-40' : ''
            }`}
          >
            <Text className="text-white font-public-sb">Send</Text>
          </TouchableOpacity>
        </View>

        {Platform.OS === 'web' && !speechSupported && (
          <Text className="text-xs font-public text-on_surface_variant text-center">
            Voice input needs a supported browser (e.g. Chrome) and microphone permission.
          </Text>
        )}

        <AuthButton
          title={finalizeLoading || storeLoading ? 'Building your plan…' : 'Build my profile'}
          onPress={handleFinalize}
          variant="primary"
          loading={finalizeLoading || storeLoading}
          disabled={!canFinalize || finalizeLoading || storeLoading}
        />
        {!canFinalize && userTurnCount < 3 && (
          <Text className="text-xs font-public text-on_surface_variant text-center">
            Share a bit more ({3 - userTurnCount} more{' '}
            {3 - userTurnCount === 1 ? 'message' : 'messages'} before we can summarize).
          </Text>
        )}

        <TouchableOpacity onPress={handleSkip} className="py-2 items-center">
          <Text className="text-base font-public text-on_surface_variant">Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const body = (
    <View className="flex-1 bg-surface">
      {main}
      {footer}
    </View>
  );

  if (Platform.OS === 'web') {
    return body;
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={12}
    >
      {body}
    </KeyboardAvoidingView>
  );
}
