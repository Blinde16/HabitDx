import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Keyboard, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCheckinStore } from '../../stores/checkinStore';
import { useAuthStore } from '../../stores/authStore';

const OBSTACLES = [
  { id: 'time', label: 'No time' },
  { id: 'energy', label: 'Low energy' },
  { id: 'forgot', label: 'Forgot' },
  { id: 'unmotivated', label: 'Low motivation' },
  { id: 'sick', label: 'Unwell' },
  { id: 'schedule', label: 'Schedule conflict' },
  { id: 'other', label: 'Other' },
];

interface ObstacleBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function ObstacleBottomSheet({ visible, onClose }: ObstacleBottomSheetProps) {
  const { user } = useAuthStore();
  const { selectedHabitForObstacle, getHabitById, logObstacle } = useCheckinStore();

  const [selectedObstacle, setSelectedObstacle] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const habit = selectedHabitForObstacle ? getHabitById(selectedHabitForObstacle) : null;

  const handleSubmit = async () => {
    if (!selectedObstacle || !habit || !user) return;

    try {
      setSubmitting(true);
      await logObstacle(habit.id, user.id, selectedObstacle, note);

      setSelectedObstacle(null);
      setNote('');
      onClose();
    } catch (err) {
      console.error('Failed to log obstacle:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedObstacle(null);
    setNote('');
    Keyboard.dismiss();
    onClose();
  };

  if (!visible || !habit) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 bg-black/40 justify-end">
        <Pressable className="flex-1" onPress={handleClose} accessibilityRole="button" />
        <View className="bg-surface_container_lowest rounded-t-3xl pt-3 pb-10 px-6">
          <View className="items-center mb-5">
            <View className="w-10 h-1 rounded-full bg-surface_container_highest" />
          </View>

          <Text className="font-manrope text-2xl text-on_surface mb-2">What got in the way?</Text>
          <Text className="font-public text-on_surface_variant mb-1">
            Habit: <Text className="font-public-sb text-on_surface">{habit.name}</Text>
          </Text>
          <Text className="text-sm font-public text-on_surface_variant mb-6 leading-5">
            This informs weekly adjustments—not a score.
          </Text>

          <View className="flex-row flex-wrap mb-6">
            {OBSTACLES.map((obstacle) => {
              const selected = selectedObstacle === obstacle.id;
              return (
                <TouchableOpacity
                  key={obstacle.id}
                  className={`mr-2 mb-2 px-4 py-3 rounded-full ${
                    selected ? 'bg-surface_container_high' : 'bg-surface_container_low'
                  }`}
                  onPress={() => setSelectedObstacle(obstacle.id)}
                  activeOpacity={0.85}
                >
                  <Text
                    className={`text-sm font-public-sb ${
                      selected ? 'text-on_surface' : 'text-on_surface_variant'
                    }`}
                  >
                    {obstacle.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedObstacle && (
            <View className="mb-6">
              <Text className="text-sm font-public-sb text-on_surface mb-2">Notes (optional)</Text>
              <TextInput
                className="bg-surface_container_lowest rounded-xl p-4 text-base font-public text-on_surface"
                style={{
                  borderWidth: 1,
                  borderColor: 'rgba(25, 28, 30, 0.12)',
                  minHeight: 88,
                  textAlignVertical: 'top',
                }}
                placeholder="e.g. meeting ran late"
                placeholderTextColor="#8a9199"
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
              <Text className="text-xs font-public text-on_surface_variant mt-2">
                {note.length}/200
              </Text>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.92}
            disabled={!selectedObstacle || submitting}
            onPress={handleSubmit}
            className="rounded-full overflow-hidden mb-3"
          >
            <LinearGradient
              colors={selectedObstacle ? ['#000000', '#131b2e'] : ['#e0e3e5', '#d1d5d9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingVertical: 16, alignItems: 'center' }}
            >
              <Text
                className={`font-public-sb text-base ${
                  selectedObstacle ? 'text-white' : 'text-on_surface_variant'
                }`}
              >
                {submitting ? 'Saving…' : 'Save'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-3 items-center"
            onPress={handleClose}
            disabled={submitting}
          >
            <Text className="text-on_surface_variant font-public-sb">Cancel</Text>
          </TouchableOpacity>

          <View className="mt-4 bg-surface_container_low rounded-xl p-4">
            <Text className="text-xs font-public text-on_surface_variant leading-5">
              Obstacles help the system suggest smaller steps or better timing—never to label you.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
