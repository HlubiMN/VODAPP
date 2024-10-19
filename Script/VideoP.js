import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, {useEffect, useState, useRef} from 'react'
import { Video } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';


export default function VideoP({route}) {

  const videoRef = useRef({});
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function setFullScreen() {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }

    setFullScreen();

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  return (
    <View style={{
      flex:1, 
      justifyContent:'center', 
      alignItems:'center', 
      backgroundColor:'black', 
      width:'100%', 
      height:'100%'}}>
      {!loading && (
        <View style={{ 
          top: '50%', 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center' }}>
          <ActivityIndicator size='large' color="white" />
        </View>
      )}
      <Video
        ref={videoRef}
        source={{uri : route.params.uri}}
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
      }}
      />
    </View>
  );
}