import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  PanResponder,
  Dimensions,
  Keyboard,
} from 'react-native';
import { useCheckinStore } from '../../stores/checkinStore';
import { useAuthStore } from '../../stores/authStore';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const OBSTACLES = [
  { id: 'time', label: 'No Time', emoji: '⏰' },
  { id: 'energy', label: 'No Energy', emoji: '😴' },
  { id: 'forgot', label: 'Forgot', emoji: '🤔' },
  { id: 'unmotivated', label: 'Unmotivated', emoji: '😐' },
  { id: 'sick', label: 'Sick/Unwell', emoji: '🤒' },
  { id: 'schedule', label: 'Schedule Conflict', emoji: '📅' },
  { id: 'other', label: 'Other', emoji: '💭' },
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
      
      // Reset and close
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
    onClose();
  };

  if (!visible || !habit) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableOpacity 
        className="flex-1 bg-black/50"
        activeOpacity={1}
        onPress={handleClose}
      >
        <View className="flex-1" />
        <TouchableOpacity 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="bg-white rounded-t-3xl pt-2 pb-8">
            {/* Handle bar */}
            <View className="items-center mb-4">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            <View className="px-6">
              {/* Header */}
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                What got in the way?
              </Text>
              <Text className="text-gray-600 mb-1">
                For habit: <Text className="font-semibold">{habit.name}</Text>
              </Text>
              <Text className="text-sm text-gray-500 mb-6">
                This helps us adjust your habits next week
              </Text>

              {/* Obstacle Options */}
              <View className="flex-row flex-wrap mb-6">
                {OBSTACLES.map((obstacle) => (
                  <TouchableOpacity
                    key={obstacle.id}
                    className={`mr-2 mb-2 px-4 py-3 rounded-lg border-2 ${
                      selectedObstacle === obstacle.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 bg-white'
                    }`}
                    onPress={() => setSelectedObstacle(obstacle.id)}
                  >
                    <Text className="text-center">
                      <Text className="text-xl">{obstacle.emoji}</Text>{' '}
                      <Text
                        className={`text-sm font-medium ${
                          selectedObstacle === obstacle.id ? 'text-purple-900' : 'text-gray-700'
                        }`}
                      >
                        {obstacle.label}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Optional Note */}
              {selectedObstacle && (
                <View className="mb-6">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Anything else? (optional)
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg p-3 text-base"
                    placeholder="E.g., 'Meeting ran late' or 'Kids were sick'"
                    value={note}
                    onChangeText={setNote}
                    multiline
                    numberOfLines={3}
                    maxLength={200}
                  />
                  <Text className="text-xs text-gray-500 mt-1">
                    {note.length}/200 characters
                  </Text>
                </View>
              )}

              {/* Actions */}
              <View className="gap-3">
                <TouchableOpacity
                  className={`py-4 rounded-lg items-center ${
                    selectedObstacle
                      ? 'bg-purple-600'
                      : 'bg-gray-300'
                  }`}
                  onPress={handleSubmit}
                  disabled={!selectedObstacle || submitting}
                >
                  <Text className="text-white font-bold text-lg">
                    {submitting ? 'Saving...' : 'Save Obstacle'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="py-3 items-center"
                  onPress={handleClose}
                  disabled={submitting}
                >
                  <Text className="text-gray-600 font-semibold">Cancel</Text>
                </TouchableOpacity>
              </View>

              {/* Info */}
              <View className="mt-4 p-3 bg-blue-50 rounded-lg">
                <Text className="text-xs text-blue-900">
                  💡 <Text className="font-semibold">Why track obstacles?</Text> Our AI uses this
                  to redesign your habits next week. If "No Time" keeps coming up, we'll make the
                  habit even smaller or move it to a better time.
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
