import { useCallback, useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { Persona } from '../../types/db';
import { theme } from '../../ui/theme';
import TinderCard from './TinderCard';

const { width: SCREEN_W } = Dimensions.get('window');
const SWIPE_OFF = SCREEN_W * 1.4;
const THRESHOLD = SCREEN_W * 0.28;

export type SwipeDirection = 'left' | 'right' | 'super';

interface Props {
  cards: Persona[];
  distanceFor: (persona: Persona) => string;
  onSwipe: (direction: SwipeDirection, persona: Persona) => void;
  swipeRequest: SwipeDirection | null;
  onSwipeRequestHandled: () => void;
}

function SwipeableTopCard({
  persona,
  nextPersona,
  distanceLabel,
  nextDistanceLabel,
  onSwiped,
  swipeRequest,
  onSwipeRequestHandled,
}: {
  persona: Persona;
  nextPersona: Persona | null;
  distanceLabel: string;
  nextDistanceLabel: string | null;
  onSwiped: (dir: SwipeDirection) => void;
  swipeRequest: SwipeDirection | null;
  onSwipeRequestHandled: () => void;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isFlying = useSharedValue(false);

  const completeSwipe = useCallback((dir: SwipeDirection) => {
    isFlying.value = false;
    onSwiped(dir);
  }, [isFlying, onSwiped]);

  const flyOff = useCallback((dir: SwipeDirection) => {
    if (isFlying.value) return;
    isFlying.value = true;
    const toX = dir === 'left' ? -SWIPE_OFF : SWIPE_OFF;
    const toY = dir === 'super' ? -SWIPE_OFF * 0.6 : 0;
    translateX.value = withTiming(toX, { duration: 260 });
    translateY.value = withTiming(toY, { duration: 260 }, (finished) => {
      if (finished) {
        translateX.value = 0;
        translateY.value = 0;
        runOnJS(completeSwipe)(dir);
      }
    });
  }, [completeSwipe, isFlying, translateX, translateY]);

  useEffect(() => {
    if (!swipeRequest) return;
    flyOff(swipeRequest);
    onSwipeRequestHandled();
  }, [swipeRequest, flyOff, onSwipeRequestHandled]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (isFlying.value) return;
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.25;
    })
    .onEnd((e) => {
      if (isFlying.value) return;
      if (e.translationX > THRESHOLD) {
        runOnJS(flyOff)('right');
      } else if (e.translationX < -THRESHOLD) {
        runOnJS(flyOff)('left');
      } else if (e.translationY < -THRESHOLD) {
        runOnJS(flyOff)('super');
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
        translateY.value = withSpring(0, { damping: 18, stiffness: 220 });
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: `${interpolate(translateX.value, [-SCREEN_W, 0, SCREEN_W], [-14, 0, 14], Extrapolation.CLAMP)}deg`,
      },
    ],
  }));

  const likeStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, THRESHOLD * 0.6], [0, 1], Extrapolation.CLAMP),
  }));

  const nopeStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-THRESHOLD * 0.6, 0], [1, 0], Extrapolation.CLAMP),
  }));

  const superStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [-THRESHOLD * 0.6, 0], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <View style={s.stack}>
      {nextPersona && nextDistanceLabel ? (
        <View style={s.behind} pointerEvents="none">
          <TinderCard persona={nextPersona} distanceLabel={nextDistanceLabel} />
        </View>
      ) : null}
      <GestureDetector gesture={pan}>
        <Animated.View style={[s.top, cardStyle]}>
          <TinderCard persona={persona} distanceLabel={distanceLabel} />
          <View style={s.stampLayer} pointerEvents="none">
            <Animated.View style={[s.nopeStamp, nopeStampStyle]}>
              <Text style={s.nopeText}>NOPE</Text>
            </Animated.View>
            <Animated.View style={[s.likeStamp, likeStampStyle]}>
              <Text style={s.likeText}>LIKE</Text>
            </Animated.View>
            <Animated.View style={[s.superStamp, superStampStyle]}>
              <Text style={s.superText}>SUPER</Text>
            </Animated.View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export default function TinderDeck({
  cards,
  distanceFor,
  onSwipe,
  swipeRequest,
  onSwipeRequestHandled,
}: Props) {
  const current = cards[0];
  const next = cards[1] ?? null;
  const handledRef = useRef(onSwipeRequestHandled);
  handledRef.current = onSwipeRequestHandled;

  const handleSwiped = useCallback((dir: SwipeDirection) => {
    if (!current) return;
    onSwipe(dir, current);
  }, [current, onSwipe]);

  if (!current) return null;

  return (
    <SwipeableTopCard
      key={current.id}
      persona={current}
      nextPersona={next}
      distanceLabel={distanceFor(current)}
      nextDistanceLabel={next ? distanceFor(next) : null}
      onSwiped={handleSwiped}
      swipeRequest={swipeRequest}
      onSwipeRequestHandled={() => handledRef.current()}
    />
  );
}

const s = StyleSheet.create({
  stack: { flex: 1, position: 'relative' },
  behind: {
    ...StyleSheet.absoluteFill,
    transform: [{ scale: 0.96 }],
    opacity: 0.92,
  },
  top: { flex: 1 },
  stampLayer: {
    ...StyleSheet.absoluteFill,
    padding: 24,
    justifyContent: 'space-between',
  },
  nopeStamp: {
    alignSelf: 'flex-start',
    borderWidth: 4,
    borderColor: theme.tinder.nope,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    transform: [{ rotate: '-18deg' }],
    marginTop: 40,
  },
  nopeText: { fontSize: 32, fontWeight: '900', color: theme.tinder.nope, letterSpacing: 3 },
  likeStamp: {
    alignSelf: 'flex-end',
    borderWidth: 4,
    borderColor: theme.tinder.like,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    transform: [{ rotate: '18deg' }],
    marginTop: 40,
  },
  likeText: { fontSize: 32, fontWeight: '900', color: theme.tinder.like, letterSpacing: 3 },
  superStamp: {
    alignSelf: 'center',
    borderWidth: 4,
    borderColor: theme.tinder.superLike,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 20,
  },
  superText: { fontSize: 28, fontWeight: '900', color: theme.tinder.superLike, letterSpacing: 2 },
});
