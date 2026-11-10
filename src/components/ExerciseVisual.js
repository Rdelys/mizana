// Illustration d'un exercice : image si disponible, sinon icône animée.
import React from 'react';
import { Animated, Image, View } from 'react-native';
import { colors, radius } from '../theme';
import { EXERCISES } from '../data/exercises';
import { EXERCISE_IMAGES } from '../data/exerciseImages';
import { Icon } from './UI';
import { useLoop } from './Motion';

const DURATIONS = { updown: 700, jump: 450, side: 600, hold: 900, rotate: 600 };

export default function ExerciseVisual({ id, size = 150, tone = 'light' }) {
  const ex = EXERCISES[id];
  const motion = ex ? ex.motion : 'hold';
  const t = useLoop(DURATIONS[motion] || 800);
  if (!ex) return null;

  const img = EXERCISE_IMAGES[id];
  if (img) {
    return (
      <Image
        source={img}
        style={{ width: '100%', height: size * 1.4, borderRadius: radius.lg, backgroundColor: '#FFFFFF' }}
        resizeMode="contain"
      />
    );
  }

  const i = (out) => t.interpolate({ inputRange: [0, 1], outputRange: out });
  const transforms = {
    updown: [{ translateY: i([-12, 14]) }, { scaleY: i([1, 0.92]) }],
    jump: [{ translateY: i([10, -26]) }, { scale: i([0.95, 1.08]) }],
    side: [{ translateX: i([-24, 24]) }],
    hold: [{ scale: i([1, 1.08]) }],
    rotate: [{ rotate: i(['-16deg', '16deg']) }],
  };

  const light = tone === 'light';
  const bg = light ? 'rgba(255,255,255,0.18)' : colors.primarySoft;
  const fg = light ? '#FFFFFF' : colors.primary;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        }}
      />
      <Animated.View style={{ transform: transforms[motion] || transforms.hold }}>
        <Icon name={ex.icon} size={size * 0.4} color={fg} />
      </Animated.View>
    </View>
  );
}