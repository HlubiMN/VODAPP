import { 
    View, 
    Text, 
    SafeAreaView, 
    StyleSheet, 
    TouchableOpacity, 
    Modal, 
    ActivityIndicator, 
    Alert } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { Video } from 'expo-av';
import { BlurView } from 'expo-blur';
import * as ScreenOrientation from 'expo-screen-orientation';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AntDesign } from '@expo/vector-icons';

import styles from './styles'
import {download} from './download.js'

export default function VideoOptions({route, navigation}) {
    const videoRef = useRef({});
    // const [download, setDownload] = useState(false);
    const [viewTrailer, setViewTrailer] = useState(false);
    const [finishedtrailer, setFinishedTrailer] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const toggleOrientation = async () => {
            if (viewTrailer) {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            } else {
                await ScreenOrientation.unlockAsync();
            }
        };

        toggleOrientation();

        return async () => {
            await ScreenOrientation.unlockAsync();
        };
    }, [viewTrailer]);

    const retrieveData = async() => {
        try {  
            const value = await AsyncStorage.getItem('_registered');
            if (value !== null){
                navigation.navigate('VideoP', {uri: route.params.details.videoUri})
            }
            else{
                console.log('no account');
                Alert.alert('Profile', 'Please complete your profile to view the full content', [
                    {
                      text: 'COMPLETE PROFILE',
                      onPress: () => navigation.navigate('Profile'),
                    },
                    {
                        text: 'CLOSE', 
                        onPress: () => console.log('OK Pressed')
                    },
                ]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const downloadApproval = async() => {
        try {  
            const value = await AsyncStorage.getItem('_registered');
            if (value !== null){
                download(route.params.details, route.params.folder);
                Alert.alert('Download', 'Movie is downloading,  it might take a while....', [
                    {
                      text: 'Back To Main Menu',
                      onPress: () => navigation.navigate('MainPage'),
                    },
                    {
                        text: 'OK', 
                        onPress: () => navigation.navigate('Downloads'),
                    },
                ]);
            }
            else{
                console.log('no account');
                Alert.alert('Profile', 'Please complete your profile to view the full content', [
                    {
                      text: 'COMPLETE PROFILE',
                      onPress: () => navigation.navigate('Profile'),
                    },
                    {
                        text: 'CLOSE', 
                        onPress: () => console.log('OK Pressed')
                    },
                ]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const VideoBackground = () => {
        return (
            <View style={[styles.screenContainer, {justifyContent: 'center', alignItems: 'center'}]}>
                <Video
                    source={{uri : route.params.details.trailerUri}}
                    shouldPlay
                    isLooping
                    isMuted
                    resizeMode="cover"
                    style={StyleSheet.absoluteFillObject}
                />
                <BlurView tint="default" intensity={180} style={StyleSheet.absoluteFill} />
            </View>
        );
    };

    return (
        <SafeAreaView style={{flex: 1}}>
            <VideoBackground/>
            <View style={styles.overlayingContainer}>
                <TouchableOpacity onPress={() => retrieveData() }>
                    <Text style={styles.options}>Watch video</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setViewTrailer(true)}>
                    <Text style={styles.options}>Watch trailer</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => downloadApproval()}>
                    <Text style={styles.options}>Download</Text>
                </TouchableOpacity>
            </View>


            <Modal
                animationType="slide"
                transparent={true}
                visible={viewTrailer}
                onRequestClose={() => {
                    setViewTrailer(!viewTrailer);
                    setLoading(false);
            }}>
                <View style={{ 
                    backgroundColor: loading ? 'transparent' : '#003020', 
                    flex: 1}}>
                    {
                        !loading && (
                            <View style={{ 
                                top: '50%', 
                                flex: 1, 
                                justifyContent: 'center', 
                                alignItems: 'center' }}>
                                <ActivityIndicator size='large' color="white" />
                            </View>
                        )
                    }
                    <Video
                        ref={videoRef}
                        source={{uri : route.params.details.trailerUri}}
                        style={{
                            width: '100%', 
                            height: '100%'
                        }}
                        useNativeControls
                        resizeMode='contain'
                        onPlaybackStatusUpdate={(status) => {
                            if (status.isLoaded){
                                setLoading(true);
                            }
                            if (status.didJustFinish) {
                                setFinishedTrailer(true);
                            }
                        }}
                    />    
                </View>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={finishedtrailer}
                onRequestClose={() => {
                    setFinishedTrailer(!finishedtrailer);
            }}>
                <TouchableOpacity onPress={() => 
                    [
                        setFinishedTrailer(false), 
                        setViewTrailer(false), 
                        setLoading(false), 
                        retrieveData()
                    ]}>
                    <Text style={{ 
                        alignSelf: 'center',
                        textAlign:'center', 
                        backgroundColor:'yellow', 
                        paddingHorizontal: '3%', 
                        paddingVertical: '2%', 
                        width: '30%', 
                        fontSize: 20, 
                        borderRadius: 10, 
                        fontWeight: 'bold'
                    }}>Watch Full Video</Text>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    )
}