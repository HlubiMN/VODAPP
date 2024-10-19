import { View, Text, SafeAreaView, ScrollView, Image, TextInput, TouchableOpacity, Linking } from 'react-native'
import React, { useEffect, useState } from 'react';

import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import styles from '../styles.js'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {database, firebase, storage} from '../config.js'

export default function Profile({navigation}) {
  // let email = 'z.s.m.hlubi@gmail.com';
  // let password = '*************'

  const [completed, setCompleted] = useState(false)
  const [_registered, _isRegistered] = useState(false)
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [userName, setUserName] = useState('');
  const [userImageUri, setUserImageUri] = useState(null);
  const [ID, setID] = useState('');
  const [IDimageUri, setIDimageUri] = useState(null);
  const [fileName, setfileName] = useState('file name');


  //TODO: save images in the sever and retrive them
  //TODO: add the eft payment method to the complete button


  const chooseFile = async (type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      console.log(result);
      if (result.assets !== null){
        if (result.assets[0].mimeType === 'image/jpeg' || result.assets[0].mimeType === 'image/png'){
          if (type === 'ID'){
            setIDimageUri(result.assets[0].uri);
            setfileName(result.assets[0].name);
            console.log('id')
          }
          else {
            setUserImageUri(result.assets[0].uri);
            console.log('i')
          }
        }
        else{
          console.log('ID upload', 'Please upload ID in a jpeg or png file');
        }
      }
      else{
        console.log('choose one file to upload');
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const varification = async () => { // function is called to validate the information about the user and check if its in a correct format
    setError('')
    openBrowser();
    if (!_registered){
      if (email.length === 0) {
        setError('User email is required!');
        return false;
      }
      else if (ID.length < 13 || IDimageUri === null) {
        setError('User ID must be 13 numbers and ID image are required!');
        return false;
      }
      else{
        try {
          const response = await firebase.auth().createUserWithEmailAndPassword(email_phoneNumber, password);
          if(response.user){
            set(ref(database, `/users/${response.user.uid}`), {
              user_Name: userName.length === 0 ? email : userName,
              ID,
            });
            console.log('successfully registered with email');
            _storeData();
            /* */
            navigation.navigate('MainPage');
          }
        } catch (error) {
          console.log( error.message);
          setError(error.message);
        }
      }
    }
    else{
      if (ID.length < 13 || IDimageUri === null) {
        setError('User ID must be 13 numbers and ID image are required!');
        return false;
      }
      else {
        const response = await firebase.auth().signInWithEmailAndPassword(email, pass);
        if(response.user){
          set(ref(database, `/users/${response.user.uid}`), {
            user_Name: userName.length === 0 ? email : userName,
            ID,
          });
          console.log('successfully registered with email');
          _storeData();
          navigation.navigate('MainPage');
        }
        else {
          setError(error.message);
          return false;
        }
      }
    }
  };

  const _storeData = async () => {
    try {
      await AsyncStorage.setItem(
        '_registered',
        true,
      );
    } catch (error) {
      setError(error.message);
    }
  };

  const openBrowser = () => {
    Linking.openURL('https://buy.stripe.com/test_dR6cNLaM079W1uU288');
  };

  const getEmail = async () => {
    try {
      const value = await AsyncStorage.getItem('email');
      const pass = await AsyncStorage.getItem('password');
      if (value !== null && pass !== null) {
        console.log('email')
        setEmail(value)
        setPassword(pass);
      }
    } catch (error) {
      setError('Please complete the registration')
    }
  };

  const isCompleted = async () => {
    const response = await firebase.auth().signInWithEmailAndPassword(email, pass);
    if (response.user){
      const retrieveData = ref(database, `/users/${response.user.uid}`);
        onValue(retrieveData, (snapshot) => {
          if(snapshot.exists()){
            const data = snapshot.val();
            setCompleted(true);
            setID(data.ID);
            setUserName(data.user_Name.length > 0 ? data.user_Name : '');

            // still need to retrive the ID and profile image from sever
          }
          else {
            return;
          }
        })
    }
    else {
      return;
    }
  }
  
  const signOut = async () => {
    await AsyncStorage.removeItem('email');
    await AsyncStorage.removeItem('password');
    navigation.navigate('Login');
  }

  useEffect(() => {
    _retrieveData = async () => {
      try {
        const value = await AsyncStorage.getItem('_registered');
        if (value !== null) {
          _isRegistered(true);
          isCompleted()
        }
      } catch (error) {
        setError('Please complete the registration')
      }
    };
    _retrieveData();
  }, []);

  return (
    <SafeAreaView style={styles.screenContainer}>
      <ScrollView style={{marginBottom: 70}}>
        {!_registered && completed && (<View style={{alignItems: 'center'}}>
          <TouchableOpacity onPress={()=> {chooseFile('profile')}}> 
            <Image // Display profile photo of the user
              style={{width: 200, height: 200, marginTop: 100, marginBottom: 50, borderRadius: 100}}
              source={userImageUri ? {uri: userImageUri} : require('../../Pictures/profile.png')}/>
          </TouchableOpacity>
          {error.length > 0 && ( // display error message
            <Text style={{
              color:'red',
              textAlign: 'center',
              fontWeight:'bold',
              marginBottom: 30,
            }}>{error}</Text>
          )}
          {email.length !== 0 && (<View style={{alignSelf: 'flex-start'}}>
            <Text style={{ // user email address
              alignSelf: 'flex-start', 
              marginLeft: '10%', 
              fontSize: 15, 
              marginVertical: 5}}>{email}</Text>
            <Text style={{ //user password
              alignSelf: 'flex-start', 
              marginLeft: '10%', 
              fontSize: 15, 
              marginVertical: 5}}>{password}</Text>
          </View>)}
          {email.length === 0 && (<View>
            <View style={[styles.inputContainerStyle, {borderColor: 'black'}]}> 
              <TextInput // user name
                underlineColorAndroid= 'transparent'
                placeholder='Email Address'
                placeholderTextColor={'black'}
                onChangeText={setUserName}
                style={[styles.textInputStyle, {color:'black'}]}
                value={userName}/>
                <Text style={{color: 'red', marginHorizontal: 12}}>Required</Text>
            </View>
          <View style={[styles.inputContainerStyle, {borderColor: 'black'}]}> 
            <TextInput // user name
              underlineColorAndroid= 'transparent'
              placeholder='User Name'
              placeholderTextColor={'black'}
              onChangeText={setUserName}
              style={[styles.textInputStyle, {color:'black'}]}
              value={userName}/>
              <Text style={{color: 'red', marginHorizontal: 12}}>Required</Text>
          </View>
          <View style={[styles.inputContainerStyle, {borderColor: 'black'}]}> 
            <TextInput // user name
              underlineColorAndroid= 'transparent'
              placeholder='User Name'
              placeholderTextColor={'black'}
              onChangeText={setUserName}
              style={[styles.textInputStyle, {color:'black'}]}
              value={userName}/>
              <Text style={{color: 'red', marginHorizontal: 12}}>Required</Text>
          </View>
          </View>)}
          <View style={[styles.inputContainerStyle, {borderColor: 'black'}]}> 
            <TextInput // user name
              underlineColorAndroid= 'transparent'
              placeholder='User Name'
              placeholderTextColor={'black'}
              onChangeText={setUserName}
              style={[styles.textInputStyle, {color:'black'}]}
              value={userName}/>
              <Text style={{color: '#E0E0E0'}}>Optional</Text>
          </View>
          <View style={[styles.inputContainerStyle, {borderColor: 'black'}]}>
            <TextInput // user Identity number
              underlineColorAndroid= 'transparent'
              placeholder='ID'
              placeholderTextColor={'black'}
              onChangeText={setID}
              style={[styles.textInputStyle, {color:'black'}]}
              value={ID}/>
              <Text style={{color: 'red'}}>Required</Text>
          </View>
          <View style={{
            borderColor: 'black', 
            flexDirection: 'row', 
            alignItems:'center', 
            alignSelf: 'flex-start', 
            marginLeft: '10%',
            width: '100%'
            }}>
            <Text style={{color:'black',fontSize: 15, marginRight: '10%', paddingLeft:10}}>ID Image</Text>            
            <TouchableOpacity style={{width:'100%'}} onPress={() => chooseFile('ID')}>
              <View style={{backgroundColor: '#E0E0E0', // user id photo
                flexDirection: 'row', 
                width: '55%', 
                height: 40, 
                borderWidth: 1,
                borderRadius: 10}}>
                <Text style={styles.chooseFileStyle}>Choose file</Text>
                <Text style={styles.fileNameStyle}>{fileName}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => {varification()}} style={{
              backgroundColor:'lightgreen',
              borderRadius: 10,
              paddingHorizontal: 20,
              paddingVertical: 5,
              marginTop: 30,
            }}>
              <Text style={{ // button to finish and upload card details
                color: 'black',
                fontSize: 20,
                textAlign: 'center',
              }}>{'Complete Profile'}</Text>
          </TouchableOpacity>
          <View style={{width:100, height:100, alignItems: 'center', justifyContent: 'center'}}>
            <TouchableOpacity onPress={() => signOut()}>
              <Text style={{fontSize: 20, fontWeight: 'bold', textDecorationLine: 'underline', }}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>)}

        {/* View Shown when the user has already completed their profile */}

        {_registered && completed && (<View style={{alignItems: 'center'}}>
          <Image // Display profile photo of the user
            style={{width: 200, height: 200, marginTop: 50,marginBottom: 10, borderRadius: 100}}
            source={userImageUri ? {uri: userImageUri} : require('../../Pictures/profile.png')}/>
          <TouchableOpacity style={{marginBottom: 40}}>
              <FontAwesome name="pencil" size={24} color="black" />
          </TouchableOpacity>
          <View style={[styles.inputContainerStyle, {alignItems: 'flex-start', borderColor: 'black'}]}> 
            <Text style={{ // user email address
              alignSelf: 'flex-start',  
              fontSize: 15, 
              marginVertical: 15}}>{email}</Text>
          </View>
          <View style={[styles.inputContainerStyle, {alignItems: 'flex-start', borderColor: 'black'}]}> 
            <Text style={{ // user password
              alignSelf: 'flex-start',  
              fontSize: 15, 
              marginVertical: 15}}>{password}</Text>
          </View>
          {userName.length !== 0 && (<View style={[styles.inputContainerStyle, {alignItems: 'flex-start', borderColor: 'black'}]}> 
            <Text style={{ // user name
              alignSelf: 'flex-start',  
              fontSize: 15, 
              marginVertical: 15}}>{userName}</Text>
          </View>)}
          <View style={[styles.inputContainerStyle, {alignItems: 'flex-start', borderColor: 'black'}]}> 
            <Text style={{ // user ID
              alignSelf: 'flex-start',  
              fontSize: 15, 
              marginVertical: 15}}>{ID}</Text>
          </View>
          <View style={{
            borderColor: 'black', 
            flexDirection: 'row', 
            alignItems:'center', 
            alignSelf: 'flex-start', 
            marginLeft: '10%',
            width: '80%',
            borderRadius: 10,
            height: 140,
            borderWidth:1,
            position: 'relative'
            }}>
              <Image 
                style={{
                  width: '100%', 
                  height: '100%', 
                  borderRadius: 10}} 
                source={IDimageUri ? {uri: IDimageUri} : require('../../Pictures/picture_2.jpg')}/>
              <View style={[styles.overlayingContainer, {
                backgroundColor: 'white', 
                position: 'absolute',
                height:'25%',
                top: '75%',
                borderBottomEndRadius: 10,
                borderBottomStartRadius: 10,
                alignItems: 'center',
                right: 0,
                left: 0}]}>
                <Text style={{ // user ID 
                  fontSize: 15}}>{fileName}</Text>
              </View>
          </View>
          <View style={{width:100, height:100, alignItems: 'center', justifyContent: 'center'}}>
            <TouchableOpacity onPress={() => signOut()}>
              <Text style={{fontSize: 20, fontWeight: 'bold', textDecorationLine: 'underline', }}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>)}

        {!_registered && !completed && (<View style={{
          alignSelf: 'center',
          marginTop: '20%'}}>
            <Image 
              style={{width: 200, height: 200, marginVertical: 50, borderRadius: 100}}
              source={require('../../Pictures/profile.png')}/>
            <Text style={{
              color: 'black',
              fontSize: 20,
            }}>Your Profile is not completed</Text>
            <TouchableOpacity onPress={() => {[setCompleted(!completed), getEmail()]}} style={{
              backgroundColor:'lightgreen',
              borderRadius: 10,
              paddingHorizontal: 20,
              paddingVertical: 5,
              marginTop: 30,
            }}>
              <Text style={{
                color: 'black',
                fontSize: 20,
                textAlign: 'center',
              }}>{'Complete your \n Profile'}</Text>
            </TouchableOpacity>
        </View>)}
      </ScrollView>
    </SafeAreaView>
  )
}