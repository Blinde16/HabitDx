import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../stores/authStore';
import { AuthButton } from '../auth';
import { ProgressIndicator } from './ProgressIndicator';
import { MultiSelectChip, CharacterCounter } from './index';
import {
  ENERGY_OPTIONS,
  GOAL_OPTIONS,
  HABIT_OPTIONS,
  OBSTACLE_OPTIONS,
  SCHEDULE_OPTIONS,
} from '../../constants/onboardingIntake';

const GUIDE_LABEL = 'HabitDx guide';

function GuideBubble({ children }: { children: React.ReactNode }) {
  return (
    <View className="mb-4 max-w-[92%] self-start">
      <View className="self-start bg-blue-600 rounded-full px-3 py-1.5 mb-2">
        <Text className="text-[10px] font-semibold uppercase tracking-[1px] text-white">
          {GUIDE_LABEL}
        </Text>
      </View>
      <View className="bg-slate-900 rounded-[22px] rounded-tl-md px-4 py-4">
        <Text className="text-base text-white leading-6">{children}</Text>
      </View>
    </View>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <View className="mb-4 max-w-[90%] self-end">
      <View className="bg-blue-100 border border-blue-200 rounded-[22px] rounded-tr-md px-4 py-3">
        <Text className="text-sm text-slate-800 leading-6">{children}</Text>
      </View>
    </View>
  );
}

function energyLabel(value: string | null) {
  const o = ENERGY_OPTIONS.find((e) => e.value === value);
  return o ? `${o.icon} ${o.label}` : '—';
}

function formatPastSummary(data: {
  pastFailures: string[];
  failureDescription: string;
}) {
  const habits = data.pastFailures.join(', ') || '(none)';
  const desc =
    data.failureDescription.length > 160
      ? `${data.failureDescription.slice(0, 160)}…`
      : data.failureDescription;
  return `${habits}\n\n${desc}`;
}

function formatConstraintsSummary(data: {
  constraints: {
    peak_energy: string | null;
    schedule_type: string[];
    obstacles: string[];
  };
}) {
  const c = data.constraints;
  return `${energyLabel(c.peak_energy)}\nSchedule: ${c.schedule_type.join(', ')}\nObstacles: ${c.obstacles.join(', ')}`;
}

function formatGoalsSummary(data: { goals: string[]; motivation: string }) {
  const g = data.goals.join(', ');
  const m =
    data.motivation.length > 120
      ? `${data.motivation.slice(0, 120)}…`
      : data.motivation;
  return `Goals: ${g}\n\nWhy: ${m}`;
}

export function OnboardingChat() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const {
    data,
    updateData,
    currentScreen,
    loadProgress,
    nextScreen,
    prevScreen,
    canProceed,
    submitOnboarding,
    loading,
    error,
  } = useOnboardingStore();
  const { user, signOut } = useAuthStore();

  const [customHabit, setCustomHabit] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentScreen, scrollToBottom]);

  const handleGetStarted = () => {
    nextScreen();
    scrollToBottom();
  };

  const handleToggleHabit = (habit: string) => {
    const current = data.pastFailures;
    if (current.includes(habit)) {
      updateData(
        'pastFailures',
        current.filter((h) => h !== habit)
      );
    } else {
      updateData('pastFailures', [...current, habit]);
    }
  };

  const handleAddCustom = () => {
    if (customHabit.trim()) {
      updateData('pastFailures', [...data.pastFailures, customHabit.trim()]);
      setCustomHabit('');
      setShowCustomInput(false);
    }
  };

  const handleNextFromStep = (screen: number) => {
    if (canProceed(screen)) {
      nextScreen();
      scrollToBottom();
    }
  };

  const handleBack = () => {
    if (currentScreen <= 1) return;
    prevScreen();
    scrollToBottom();
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Not logged in', 'No user session found. Please sign out and sign back in.');
      return;
    }
    try {
      setSubmitting(true);
      await submitOnboarding(user.id);
      router.push('/(onboarding)/failure-profile');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      Alert.alert('Submission Error', msg);
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (e) {
      console.error('Skip onboarding error:', e);
    }
  };

  const history = (
    <>
      {currentScreen > 1 && (
        <>
          <GuideBubble>
            Let&apos;s build your first plan like a conversation, not a quiz. I&apos;ll ask a few
            short questions about what you&apos;ve tried, what gets in the way, and what matters
            most.
          </GuideBubble>
          <UserBubble>I&apos;m ready — let&apos;s go.</UserBubble>
        </>
      )}
      {currentScreen > 2 && (
        <>
          <GuideBubble>
            Tell me about the habits that keep slipping. Start with ones you&apos;ve genuinely
            tried, even if they only lasted a few days.
          </GuideBubble>
          <UserBubble>{formatPastSummary(data)}</UserBubble>
        </>
      )}
      {currentScreen > 3 && (
        <>
          <GuideBubble>
            Now let&apos;s make this fit your life — your energy, schedule, and what usually knocks
            you off track.
          </GuideBubble>
          <UserBubble>{formatConstraintsSummary(data)}</UserBubble>
        </>
      )}
      {currentScreen > 4 && (
        <>
          <GuideBubble>
            What do you want these habits to unlock? Choose up to three outcomes that would make
            this feel genuinely worth it.
          </GuideBubble>
          <UserBubble>{formatGoalsSummary(data)}</UserBubble>
        </>
      )}
    </>
  );

  const stepIntro = (
    <>
      {currentScreen === 1 && (
        <GuideBubble>
          Let&apos;s build your first plan like a conversation, not a quiz. I&apos;ll ask a few
          short questions about what you&apos;ve tried, what gets in the way, and what matters most.
          {'\n\n'}
          Most people finish in about five minutes. You can revise answers as we go.
        </GuideBubble>
      )}
      {currentScreen === 2 && (
        <GuideBubble>
          Tell me about the habits that keep slipping. Start with ones you&apos;ve genuinely tried,
          even if they only lasted a few days. Pick what feels familiar, then describe the pattern in
          your own words.
        </GuideBubble>
      )}
      {currentScreen === 3 && (
        <GuideBubble>
          Now let&apos;s make this fit your real life — not an ideal week. I&apos;m looking for
          your energy patterns, schedule shape, and the friction that shows up most often.
        </GuideBubble>
      )}
      {currentScreen === 4 && (
        <GuideBubble>
          What do you want these habits to unlock? Choose up to three outcomes that would make this
          feel genuinely worth it — focus beats ambition here.
        </GuideBubble>
      )}
      {currentScreen === 5 && (
        <GuideBubble>
          Here&apos;s what happens next: we&apos;ll analyze your answers, show your Habit Profile,
          then suggest 1–3 small habits matched to you. If anything below feels off, go
          back and fix it — small accuracy wins here.
        </GuideBubble>
      )}
    </>
  );

  const pastFailuresForm = (
    <View className="bg-white border border-gray-200 rounded-[24px] p-4 mb-4">
      <Text className="text-base font-semibold text-gray-800 mb-2">What have you tried?</Text>
      <Text className="text-sm text-gray-500 leading-6 mb-3">
        Choose every habit you&apos;ve started and struggled to keep going.
      </Text>
      <View className="flex-row flex-wrap">
        {HABIT_OPTIONS.map((habit) => (
          <MultiSelectChip
            key={habit}
            label={habit}
            selected={data.pastFailures.includes(habit)}
            onPress={() => handleToggleHabit(habit)}
          />
        ))}
        {data.pastFailures
          .filter((h) => !(HABIT_OPTIONS as readonly string[]).includes(h))
          .map((habit) => (
            <MultiSelectChip
              key={habit}
              label={habit}
              selected={true}
              onPress={() => handleToggleHabit(habit)}
            />
          ))}
      </View>
      {data.pastFailures.length > 0 && (
        <Text className="text-sm text-blue-700 mt-2 font-medium">
          {data.pastFailures.length} habit{data.pastFailures.length === 1 ? '' : 's'} selected
        </Text>
      )}
      {!showCustomInput ? (
        <TouchableOpacity className="mt-2 py-2" onPress={() => setShowCustomInput(true)}>
          <Text className="text-sm text-blue-500 font-semibold">+ Add other</Text>
        </TouchableOpacity>
      ) : (
        <View className="mt-3">
          <CharacterCounter
            value={customHabit}
            onChangeText={setCustomHabit}
            minLength={2}
            maxLength={50}
            label="Custom habit"
            placeholder="e.g., Learning Spanish"
          />
          <View className="flex-row gap-3 mt-2">
            <TouchableOpacity
              className="flex-1 py-3 items-center rounded-lg bg-gray-100"
              onPress={() => {
                setShowCustomInput(false);
                setCustomHabit('');
              }}
            >
              <Text className="text-base font-semibold text-gray-500">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 items-center rounded-lg bg-blue-500 ${!customHabit.trim() ? 'opacity-50' : ''}`}
              onPress={handleAddCustom}
              disabled={!customHabit.trim()}
            >
              <Text className="text-base font-semibold text-white">Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <CharacterCounter
        value={data.failureDescription}
        onChangeText={(text) => updateData('failureDescription', text)}
        minLength={20}
        maxLength={500}
        label="What usually happens when these habits fall apart?"
        placeholder="Example: I start strong, then miss one day, feel behind, and stop opening the app."
      />
    </View>
  );

  const constraintsForm = (
    <>
      <View className="bg-white border border-gray-200 rounded-[24px] p-4 mb-4">
        <Text className="text-base font-semibold text-gray-700 mb-2">
          When do you have the most energy?
        </Text>
        <Text className="text-sm text-gray-500 leading-6 mb-3">
          We&apos;ll lean on your easiest window instead of demanding willpower at the wrong time.
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {ENERGY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              className={`min-w-[22%] flex-1 py-3 items-center rounded-2xl border ${
                data.constraints.peak_energy === option.value
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-gray-50 border-gray-200'
              }`}
              onPress={() =>
                updateData('constraints', {
                  ...data.constraints,
                  peak_energy: option.value,
                })
              }
            >
              <Text className="text-2xl mb-1">{option.icon}</Text>
              <Text
                className={`text-xs font-semibold text-center ${
                  data.constraints.peak_energy === option.value ? 'text-white' : 'text-gray-600'
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View className="bg-white border border-gray-200 rounded-[24px] p-4 mb-4">
        <Text className="text-base font-semibold text-gray-700 mb-2">
          What&apos;s your daily schedule like?
        </Text>
        <Text className="text-sm text-gray-500 leading-6 mb-3">
          Choose the patterns that shape when habits do or don&apos;t happen.
        </Text>
        <View className="flex-row flex-wrap">
          {SCHEDULE_OPTIONS.map((schedule) => (
            <MultiSelectChip
              key={schedule}
              label={schedule}
              selected={data.constraints.schedule_type.includes(schedule)}
              onPress={() => {
                const current = data.constraints.schedule_type;
                updateData('constraints', {
                  ...data.constraints,
                  schedule_type: current.includes(schedule)
                    ? current.filter((s) => s !== schedule)
                    : [...current, schedule],
                });
              }}
            />
          ))}
        </View>
      </View>
      <View className="bg-white border border-gray-200 rounded-[24px] p-4 mb-4">
        <Text className="text-base font-semibold text-gray-700 mb-2">
          What makes habits hard for you?
        </Text>
        <Text className="text-sm text-gray-500 leading-6 mb-3">
          Pick the friction points that show up most often.
        </Text>
        <View className="flex-row flex-wrap">
          {OBSTACLE_OPTIONS.map((obstacle) => (
            <MultiSelectChip
              key={obstacle}
              label={obstacle}
              selected={data.constraints.obstacles.includes(obstacle)}
              onPress={() => {
                const current = data.constraints.obstacles;
                updateData('constraints', {
                  ...data.constraints,
                  obstacles: current.includes(obstacle)
                    ? current.filter((o) => o !== obstacle)
                    : [...current, obstacle],
                });
              }}
            />
          ))}
        </View>
      </View>
    </>
  );

  const goalsForm = (
    <>
      <View className="bg-white border border-gray-200 rounded-[24px] p-4 mb-4">
        <Text className="text-base font-semibold text-gray-800 mb-2">What matters most right now?</Text>
        <Text className="text-sm text-gray-500 leading-6 mb-3">
          Pick up to three goals. Tap again to deselect.
        </Text>
        <View className="flex-row flex-wrap gap-2 justify-between">
          {GOAL_OPTIONS.map((goal) => {
            const isSelected = data.goals.includes(goal.value);
            const isDisabled = !isSelected && data.goals.length >= 3;
            return (
              <TouchableOpacity
                key={goal.value}
                className={`w-[48%] min-h-[100px] p-3 rounded-[20px] border items-center justify-center relative mb-2 ${
                  isSelected ? 'bg-blue-600 border-blue-600' : 'bg-gray-50 border-gray-200'
                } ${isDisabled ? 'opacity-50' : ''}`}
                onPress={() => {
                  const current = data.goals;
                  if (current.includes(goal.value)) {
                    updateData(
                      'goals',
                      current.filter((g) => g !== goal.value)
                    );
                  } else if (current.length < 3) {
                    updateData('goals', [...current, goal.value]);
                  }
                }}
                disabled={isDisabled}
              >
                <Text className="text-3xl mb-1">{goal.icon}</Text>
                <Text
                  className={`text-xs font-semibold text-center ${
                    isSelected ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {goal.value}
                </Text>
                {isSelected && (
                  <View className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white items-center justify-center">
                    <Text className="text-blue-600 text-xs font-bold">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        {data.goals.length > 0 && (
          <Text className="text-sm text-gray-500 text-center mt-2">
            {data.goals.length} of 3 selected
          </Text>
        )}
      </View>
      <View className="bg-white border border-gray-200 rounded-[24px] p-4 mb-4">
        <CharacterCounter
          value={data.motivation}
          onChangeText={(text) => updateData('motivation', text)}
          minLength={20}
          maxLength={300}
          label="Why does this matter right now?"
          placeholder="Example: If I had more energy and a steadier routine, I'd feel less behind every day."
        />
      </View>
    </>
  );

  const confirmationBlock = (
    <View className="bg-white border border-gray-200 rounded-[24px] p-4 mb-4">
      <Text className="text-base font-semibold text-gray-900 mb-3">Can we send helpful reminders?</Text>
      <TouchableOpacity
        className="flex-row items-center mb-2"
        onPress={() => updateData('notificationsEnabled', !data.notificationsEnabled)}
      >
        <View
          className={`w-[51px] h-[31px] rounded-2xl p-0.5 ${
            data.notificationsEnabled ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          <View
            className="w-[27px] h-[27px] rounded-full bg-white"
            style={{
              transform: [{ translateX: data.notificationsEnabled ? 20 : 0 }],
            }}
          />
        </View>
        <Text className="ml-3 text-base text-gray-900">
          {data.notificationsEnabled ? 'Enabled' : 'Disabled'}
        </Text>
      </TouchableOpacity>
      <Text className="text-xs text-gray-400">You can change this anytime in settings.</Text>
    </View>
  );

  const mainScroll = (
    <ScrollView
      ref={scrollRef}
      className="flex-1"
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      onContentSizeChange={scrollToBottom}
    >
      <View className="w-full max-w-lg self-center">
        <ProgressIndicator current={currentScreen} total={5} />
        {history}
        {stepIntro}
        {error && (
          <View className="bg-red-100 rounded-xl p-3 mb-3 border-l-4 border-red-500">
            <Text className="text-red-900 text-sm">{error}</Text>
          </View>
        )}
        {currentScreen === 1 && (
          <View className="bg-white rounded-[24px] px-4 py-4 border border-blue-100 mb-4 mt-2">
            <Text className="text-xs font-semibold text-blue-700 uppercase tracking-[1px] mb-3">
              What you&apos;ll get
            </Text>
            <Text className="text-sm text-slate-700 mb-2">🎯 A personalized habit profile</Text>
            <Text className="text-sm text-slate-700 mb-2">🧠 Habits matched to real constraints</Text>
            <Text className="text-sm text-slate-700">📈 Weekly course-corrections</Text>
          </View>
        )}
        {currentScreen === 2 && pastFailuresForm}
        {currentScreen === 3 && constraintsForm}
        {currentScreen === 4 && goalsForm}
        {currentScreen === 5 && confirmationBlock}
      </View>
    </ScrollView>
  );

  const actions = (
    <View className="px-5 pb-6 pt-2 border-t border-slate-100 bg-[#F5F8FF]">
      <View className="w-full max-w-lg self-center gap-3">
        {currentScreen === 1 && (
          <>
            <AuthButton title="Get started" onPress={handleGetStarted} variant="primary" />
            <TouchableOpacity onPress={handleSkip} className="p-2 items-center">
              <Text className="text-base text-gray-500">Skip for now</Text>
            </TouchableOpacity>
          </>
        )}
        {currentScreen === 2 && (
          <>
            {!canProceed(2) && (
              <Text className="text-xs text-center text-gray-500">
                {data.pastFailures.length === 0
                  ? 'Select at least one habit above.'
                  : data.failureDescription.length < 20
                    ? `Add ${20 - data.failureDescription.length} more characters to your description.`
                    : null}
              </Text>
            )}
            <TouchableOpacity className="py-2 items-center" onPress={handleBack}>
              <Text className="text-base text-blue-600 font-semibold">← Back</Text>
            </TouchableOpacity>
            <AuthButton
              title={canProceed(2) ? 'That sounds right' : 'Answer to continue'}
              onPress={() => handleNextFromStep(2)}
              variant="primary"
              disabled={!canProceed(2)}
            />
          </>
        )}
        {currentScreen === 3 && (
          <>
            {!canProceed(3) && (
              <Text className="text-xs text-center text-gray-500">
                Choose energy, at least one schedule pattern, and at least one obstacle.
              </Text>
            )}
            <TouchableOpacity className="py-2 items-center" onPress={handleBack}>
              <Text className="text-base text-blue-600 font-semibold">← Back</Text>
            </TouchableOpacity>
            <AuthButton
              title={canProceed(3) ? 'Keep going' : 'Answer to continue'}
              onPress={() => handleNextFromStep(3)}
              variant="primary"
              disabled={!canProceed(3)}
            />
          </>
        )}
        {currentScreen === 4 && (
          <>
            {!canProceed(4) && (
              <Text className="text-xs text-center text-gray-500">
                Pick at least one goal and a short &quot;why&quot; (20+ characters).
              </Text>
            )}
            <TouchableOpacity className="py-2 items-center" onPress={handleBack}>
              <Text className="text-base text-blue-600 font-semibold">← Back</Text>
            </TouchableOpacity>
            <AuthButton
              title={canProceed(4) ? 'Review my plan' : 'Answer to continue'}
              onPress={() => handleNextFromStep(4)}
              variant="primary"
              disabled={!canProceed(4)}
            />
          </>
        )}
        {currentScreen === 5 && (
          <>
            <View className="p-3 bg-green-50 rounded-2xl mb-2 border border-green-100">
              <Text className="text-sm text-green-800 text-center">
                Your data stays private and is used only to personalize your plan.
              </Text>
            </View>
            <TouchableOpacity className="py-2 items-center" onPress={handleBack} disabled={submitting}>
              <Text className="text-base text-blue-600 font-semibold">← Back</Text>
            </TouchableOpacity>
            <AuthButton
              title={submitting ? 'Analyzing…' : 'Build my habit plan'}
              onPress={handleSubmit}
              variant="primary"
              loading={submitting || loading}
              disabled={submitting || loading}
            />
          </>
        )}
      </View>
    </View>
  );

  const body = (
    <>
      {mainScroll}
      {actions}
    </>
  );

  if (Platform.OS === 'web') {
    return <View className="flex-1 bg-[#F5F8FF]">{body}</View>;
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F5F8FF]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={12}
    >
      {body}
    </KeyboardAvoidingView>
  );
}
