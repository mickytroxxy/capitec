import { colors } from "@/constants/Colors";
import { RootState } from "@/state/store";
import { useEffect, useRef } from "react";
import { Animated, Easing, Modal, View } from "react-native";
import { useSelector } from "react-redux";
import Icon from "./Icon";

const AnimatedView = Animated.createAnimatedComponent(View);

const BOX_SIZE = 9;
const BIG_SIZE = 12;
const SCALE_BIG = BIG_SIZE / BOX_SIZE;
const BORDER_RADIUS = 1;

export const Loader = () => {
    const { state } = useSelector((state: RootState) => state.loader);
    const animationValue = useRef(new Animated.Value(0)).current;
    const scales = [
        useRef(new Animated.Value(1)).current,
        useRef(new Animated.Value(1)).current,
        useRef(new Animated.Value(1)).current,
        useRef(new Animated.Value(1)).current,
    ];

    useEffect(() => {
        if (state.isloading) {
            if (state.type === 'lock') {
                // Single animation for both rotation and color
                Animated.loop(
                    Animated.timing(animationValue, {
                        toValue: 1,
                        duration: 2000,
                        easing: Easing.linear,
                        useNativeDriver: false
                    })
                ).start();
            } else {
                const animations = scales.flatMap((scale) => [
                    Animated.timing(scale, {
                        toValue: SCALE_BIG,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scale, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]);
                Animated.loop(
                    Animated.sequence(animations)
                ).start();
            }
        }
    }, [state.isloading, state.type, scales]);

    if (!state.isloading) return null;

    return (
        <Modal
            visible={state.isloading}
            transparent={true}
            animationType="fade"
        >
            <View style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <View style={{

                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {state.type === 'spinner' &&
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                            <Animated.View style={[{ width: BOX_SIZE, height: BOX_SIZE, backgroundColor: colors.primary, borderRadius: BORDER_RADIUS }, { transform: [{ scale: scales[0] }] }]} />
                            <Animated.View style={[{ width: BOX_SIZE, height: BOX_SIZE, backgroundColor: '#140937ff', borderRadius: BORDER_RADIUS }, { transform: [{ scale: scales[1] }] }]} />
                            <Animated.View style={[{ width: BOX_SIZE, height: BOX_SIZE, backgroundColor: colors.gray, borderRadius: BORDER_RADIUS }, { transform: [{ scale: scales[2] }] }]} />
                            <Animated.View style={[{ width: BOX_SIZE, height: BOX_SIZE, backgroundColor: 'tomato', borderRadius: BORDER_RADIUS }, { transform: [{ scale: scales[3] }] }]} />
                        </View>
                    }
                    {state?.type === 'lock' && 
                        <View style={{
                            padding: 3,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <View style={{
                                width: 100,
                                height: 100,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {/* Static centered icon */}
                                <View style={{
                                    position: 'absolute',
                                    zIndex: 1,
                                    width: 60,
                                    height: 60,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Icon type="AntDesign" name="lock" size={48} color="#3a3861ff" />
                                </View>
                                
                                {/* Rotating border only */}
                                <AnimatedView style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 50,
                                    borderWidth: 3,
                                    transform: [{
                                        rotate: animationValue.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0deg', '360deg']
                                        })
                                    }],
                                    borderColor: animationValue.interpolate({
                                        inputRange: [0, 0.25, 0.5, 0.75, 1],
                                        outputRange: [colors.primary, '#333333', colors.gray, colors.primary,'#f77a7aff']
                                    })
                                }} />
                            </View>
                        </View>
                    }
                    
                </View>
            </View>
        </Modal>
    );
};