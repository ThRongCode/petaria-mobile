import { useRef, useCallback } from 'react'
import { Animated, Easing } from 'react-native'

export type CaptureState = 'idle' | 'throwing' | 'shaking' | 'success' | 'failed'

interface UseCaptureAnimationReturn {
  pokeballAnim: Animated.Value
  shakeAnim: Animated.Value
  pokemonOpacity: Animated.Value
  pokemonScale: Animated.Value
  sparkleAnim: Animated.Value
  resetCaptureAnimations: () => void
  playCaptureAnimation: (success: boolean, setCaptureState: (state: CaptureState) => void) => Promise<void>
  getAnimationInterpolations: () => {
    pokeballTranslateY: Animated.AnimatedInterpolation<string | number>
    pokeballScale: Animated.AnimatedInterpolation<string | number>
    shakeRotate: Animated.AnimatedInterpolation<string | number>
    sparkleScale: Animated.AnimatedInterpolation<string | number>
  }
}

export const useCaptureAnimation = (): UseCaptureAnimationReturn => {
  const pokeballAnim = useRef(new Animated.Value(0)).current
  const shakeAnim = useRef(new Animated.Value(0)).current
  const pokemonOpacity = useRef(new Animated.Value(1)).current
  const pokemonScale = useRef(new Animated.Value(1)).current
  const sparkleAnim = useRef(new Animated.Value(0)).current

  const resetCaptureAnimations = useCallback(() => {
    pokeballAnim.setValue(0)
    shakeAnim.setValue(0)
    pokemonOpacity.setValue(1)
    pokemonScale.setValue(1)
    sparkleAnim.setValue(0)
  }, [pokeballAnim, shakeAnim, pokemonOpacity, pokemonScale, sparkleAnim])

  const playCaptureAnimation = useCallback((
    success: boolean,
    setCaptureState: (state: CaptureState) => void
  ): Promise<void> => {
    return new Promise((resolve) => {
      console.log('🎬 Starting capture animation, success:', success)
      
      // Phase 1: Throw pokeball (pokeball flies in)
      setCaptureState('throwing')
      
      Animated.timing(pokeballAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        console.log('🎬 Phase 1 complete - pokeball thrown')
        
        // Phase 2: Pokemon shrinks and fades (being captured)
        Animated.parallel([
          Animated.timing(pokemonOpacity, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pokemonScale, {
            toValue: 0.5,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          console.log('🎬 Phase 2 complete - pokemon captured')
          
          // Phase 3: Shake animation
          setCaptureState('shaking')
          
          const shakeCount = success ? 3 : 2
          
          // Create shake animation
          const createShake = () => Animated.sequence([
            Animated.timing(shakeAnim, {
              toValue: 1,
              duration: 150,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
              toValue: -1,
              duration: 150,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(shakeAnim, {
              toValue: 0,
              duration: 150,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.delay(200),
          ])
          
          // Build shake sequence
          const shakeSequence = Array(shakeCount).fill(null).map(() => createShake())
          
          Animated.sequence(shakeSequence).start(() => {
            console.log('🎬 Phase 3 complete - shaking done')
            
            if (success) {
              // Phase 4: Success - sparkle animation
              setCaptureState('success')
              Animated.timing(sparkleAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }).start(() => {
                console.log('🎬 Phase 4 complete - success!')
                setTimeout(resolve, 300)
              })
            } else {
              // Phase 4: Failed - Pokemon breaks free
              setCaptureState('failed')
              Animated.parallel([
                Animated.timing(pokemonOpacity, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }),
                Animated.timing(pokemonScale, {
                  toValue: 1,
                  duration: 300,
                  easing: Easing.bounce,
                  useNativeDriver: true,
                }),
                Animated.timing(pokeballAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]).start(() => {
                console.log('🎬 Phase 4 complete - escaped!')
                setTimeout(resolve, 300)
              })
            }
          })
        })
      })
    })
  }, [pokeballAnim, pokemonOpacity, pokemonScale, shakeAnim, sparkleAnim])

  const getAnimationInterpolations = useCallback(() => {
    const pokeballTranslateY = pokeballAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 0],
    })
    
    const pokeballScaleInterp = pokeballAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 1.2, 1],
    })
    
    const shakeRotate = shakeAnim.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: ['-20deg', '0deg', '20deg'],
    })
    
    const sparkleScaleInterp = sparkleAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1.5, 1],
    })

    return {
      pokeballTranslateY,
      pokeballScale: pokeballScaleInterp,
      shakeRotate,
      sparkleScale: sparkleScaleInterp,
    }
  }, [pokeballAnim, shakeAnim, sparkleAnim])

  return {
    pokeballAnim,
    shakeAnim,
    pokemonOpacity,
    pokemonScale,
    sparkleAnim,
    resetCaptureAnimations,
    playCaptureAnimation,
    getAnimationInterpolations,
  }
}
