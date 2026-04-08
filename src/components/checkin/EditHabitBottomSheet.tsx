import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Keyboard,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { HabitWithStatus } from '../../stores/checkinStore';

interface EditHabitBottomSheetProps {
  visible: boolean;
  habit: HabitWithStatus | null;
  onSave: (habitId: string, updates: HabitWordingUpdates) => Promise<void>;
  onClose: () => void;
}

export interface HabitWordingUpdates {
  name: string;
  tiny_version: string;
  anchor: string;
  celebration: string;
}

const FIELD_CONFIG = [
  {
    key: 'name' as const,
    label: 'Name',
    placeholder: 'e.g. Morning movement',
    maxLength: 80,
    multiline: false,
    hint: 'A short title for this habit.',
  },
  {
    key: 'tiny_version' as const,
    label: 'Tiny version',
    placeholder: 'e.g. Put on shoes and step outside',
    maxLength: 200,
    multiline: true,
    hint: 'The absolute minimum version you can do on a hard day.',
  },
  {
    key: 'anchor' as const,
    label: 'Anchor',
    placeholder: 'e.g. After I pour my morning coffee',
    maxLength: 200,
    multiline: false,
    hint: 'An existing routine this attaches to.',
  },
  {
    key: 'celebration' as const,
    label: 'Celebration',
    placeholder: 'e.g. Fist pump and say "Yes!"',
    maxLength: 200,
    multiline: false,
    hint: 'A small reward right after completing.',
  },
];

export default function EditHabitBottomSheet({
  visible,
  habit,
  onSave,
  onClose,
}: EditHabitBottomSheetProps) {
  const [fields, setFields] = useState<HabitWordingUpdates>({
    name: '',
    tiny_version: '',
    anchor: '',
    celebration: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (habit) {
      setFields({
        name: habit.name,
        tiny_version: habit.tiny_version,
        anchor: habit.anchor,
        celebration: habit.celebration,
      });
    }
  }, [habit]);

  const hasChanges =
    habit != null &&
    (fields.name !== habit.name ||
      fields.tiny_version !== habit.tiny_version ||
      fields.anchor !== habit.anchor ||
      fields.celebration !== habit.celebration);

  const isValid = fields.name.trim().length > 0 && fields.tiny_version.trim().length > 0;

  const handleSave = async () => {
    if (!habit || !hasChanges || !isValid) return;

    const trimmed: HabitWordingUpdates = {
      name: fields.name.trim(),
      tiny_version: fields.tiny_version.trim(),
      anchor: fields.anchor.trim(),
      celebration: fields.celebration.trim(),
    };

    try {
      setSaving(true);
      await onSave(habit.id, trimmed);
      onClose();
    } catch (err) {
      console.error('Failed to update habit:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  if (!visible || !habit) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 bg-black/40 justify-end">
          <Pressable className="flex-1" onPress={handleClose} accessibilityRole="button" />
          <View className="bg-surface_container_lowest rounded-t-3xl pt-3 pb-10 px-6 max-h-[85%]">
            <View className="items-center mb-5">
              <View className="w-10 h-1 rounded-full bg-surface_container_highest" />
            </View>

            <Text className="font-manrope text-2xl text-on_surface mb-1">Edit habit</Text>
            <Text className="text-sm font-public text-on_surface_variant mb-6 leading-5">
              Adjust the wording so it fits your life better.
            </Text>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              className="mb-4"
            >
              {FIELD_CONFIG.map((cfg) => (
                <View key={cfg.key} className="mb-5">
                  <Text className="text-sm font-public-sb text-on_surface mb-1">{cfg.label}</Text>
                  <Text className="text-xs font-public text-on_surface_variant mb-2">
                    {cfg.hint}
                  </Text>
                  <TextInput
                    className="bg-surface_container_lowest rounded-xl p-4 text-base font-public text-on_surface"
                    style={{
                      borderWidth: 1,
                      borderColor: 'rgba(25, 28, 30, 0.12)',
                      ...(cfg.multiline ? { minHeight: 80, textAlignVertical: 'top' } : {}),
                    }}
                    placeholder={cfg.placeholder}
                    placeholderTextColor="#8a9199"
                    value={fields[cfg.key]}
                    onChangeText={(text) => setFields((prev) => ({ ...prev, [cfg.key]: text }))}
                    multiline={cfg.multiline}
                    numberOfLines={cfg.multiline ? 3 : 1}
                    maxLength={cfg.maxLength}
                    editable={!saving}
                  />
                  <Text className="text-xs font-public text-on_surface_variant mt-1 text-right">
                    {fields[cfg.key].length}/{cfg.maxLength}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.92}
              disabled={!hasChanges || !isValid || saving}
              onPress={handleSave}
              className="rounded-full overflow-hidden mb-3"
            >
              <LinearGradient
                colors={hasChanges && isValid ? ['#000000', '#131b2e'] : ['#e0e3e5', '#d1d5d9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
              >
                {saving && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />}
                <Text
                  className={`font-public-sb text-base ${
                    hasChanges && isValid ? 'text-white' : 'text-on_surface_variant'
                  }`}
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              className="py-3 items-center"
              onPress={handleClose}
              disabled={saving}
            >
              <Text className="text-on_surface_variant font-public-sb">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
