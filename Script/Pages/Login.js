import { View, Text, TextInput, SafeAreaView, TouchableOpacity, Image, ActivityIndicator, ScrollView, Button } from 'react-native'
import React, { useState, useEffect } from 'react'
import AsyncStorage from "@react-native-async-storage/async-storage";

//import icon
import { Entypo } from '@expo/vector-icons';

import styles from '../styles.js'
import {database, firebase, storage} from '../config.js'

export default function Login({navigation}) {
    let basicColor = 'white';
    const[hide, setHide] = useState(true);
    const[error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const[email, setEmail] = useState('');
    const[password, setPassword] = useState('');

    const[register, setRegister] = useState(false);
    const[coPassword, setCoPassword] = useState('');

    const varification = async () => { // function is called to validate the information about the user and check if its in a correct format
        setError('')
        if (!register){
            if (email.length === 0) {
                setError('User email is required!');
                return false;
            }
            else { 
                const response = await firebase.auth().signInWithEmailAndPassword(email, password);
                if (response.user){ /*if the email and password match on the database return true to login with an account*/
                    console.log('successfully signed in');
                    saveData();
                    navigation.navigate('HomePage');
                }
                else{
                    setError(`User doesn't exist`)
                }
            }
        }
        else {
            if (email.length === 0) {
                setError('User email is required!');
                return false;
            }
            else if ((coPassword !== password) && (password.length < 6) && (coPassword.length < 6)){
                setError('Password does not match! \n  Password must be at least 6 characters!');
                return false;
            }
            else{
                try { /* if the registration was successful and the user was created on the database it will return true*/ 
                    const response = await firebase.auth().createUserWithEmailAndPassword(email, password);
                    if(response.user){
                        saveData();
                        navigation.navigate('HomePage');
                    }
                } catch (error) {
                    console.log(error.message);
                    setError(error.message);
                }
            }
        }
    };

    const saveData = async() => {
        try {
            await AsyncStorage.setItem('email', email);
            await AsyncStorage.setItem('password', password);
        } catch (error) {
            console.error(error);
        }
    };

    const forgotPassword = async () =>{
        setError('')
        if (email.length === 0) {
            setError('User email is required!');
            return;
        }
        else {/* send a forgot password email to the eamil address */
            await firebase.auth().sendPasswordResetEmail(email)
            .then(() => {
                alert('Email is sent....,\n Reset Password');
            }).catch((error) => {
                console.error(error);
            })
            return;
        }
    }

    useEffect(() => {
        const loggedIn = async () => {
            let em = await AsyncStorage.getItem('email');
            let ps = await AsyncStorage.getItem('password');
            if (em !== null && ps !== null) {
                console.log(em)
                navigation.navigate('HomePage')
            }
        }
        loggedIn();
        setLoading(false);
      }, []);

    return (
        <SafeAreaView>
            <ScrollView>
                <Image
                    style={{flex:1}}
                    source={require('../../Pictures/picture_2.jpg')}/>
                <View style={styles.overlayingContainer}>
                    {loading && (
                        <View style={{width:'100%', height:'100%', justifyContent:'center'}}>
                        <ActivityIndicator size='large' color="black" />
                        </View>
                    )}

                    {error.length > 0 && (
                        <Text style={{
                            color:'red',
                            textAlign: 'center',
                            fontWeight:'bold',
                            marginBottom: 30,
                        }}>{error}</Text>
                    )}
                    {email.length !== 0 && (
                        <Text style={[styles.textAboveInput, {marginLeft: 50}]}>{'Email Address'}</Text>
                    )}
                    <View style={styles.inputContainerStyle}>
                        <TextInput
                            underlineColorAndroid= 'transparent'
                            placeholder={'Email Address'}
                            placeholderTextColor={basicColor}
                            onChangeText={setEmail}
                            style={styles.textInputStyle}
                            keyboardType={'default'}
                            value={email}/>
                        <Entypo name={'mail'} size={24} color="white" />
                    </View>
                    {password.length !== 0 && (
                        <Text style={[styles.textAboveInput, {marginLeft: 50}]}>Password</Text>
                    )}
                    <View style={styles.inputContainerStyle}>
                        <TextInput
                            underlineColorAndroid= 'transparent'
                            placeholder='Password'
                            placeholderTextColor={basicColor}
                            onChangeText={setPassword}
                            secureTextEntry={hide}
                            style={styles.textInputStyle}
                            value={password}/>
                        <Entypo onPress={() => setHide(!hide)} name={hide ? 'eye-with-line' : 'eye'} size={24} color="white" />
                    </View>

                    {coPassword.length !== 0 && (
                        <Text style={[styles.textAboveInput, {marginLeft: 50}]}>Confirm Password</Text>
                    )}
                    {register && (<View style={styles.inputContainerStyle}>
                        <TextInput
                            underlineColorAndroid= 'transparent'
                            placeholder='Confirm Password'
                            placeholderTextColor={basicColor}
                            onChangeText={setCoPassword}
                            secureTextEntry={hide}
                            style={styles.textInputStyle}
                            value={coPassword}/>
                        <Entypo onPress={() => setHide(!hide)} name={hide ? 'eye-with-line' : 'eye'} size={24} color="white" />
                    </View>)}

                    {!register && (<TouchableOpacity onPress={() => {forgotPassword()}}>
                        <Text style={{
                            color: basicColor, 
                            textDecorationLine: 'underline', 
                            marginTop: 2,
                            fontSize: 15}}>forgot pasword</Text>
                    </TouchableOpacity>)}

                    <TouchableOpacity onPress={() => {varification()}} style={{
                        backgroundColor: !register ? 'lightgreen' : 'red',
                        borderRadius: 10,
                        paddingHorizontal: 20,
                        paddingVertical: 5,
                        marginTop: 10,
                    }}>
                        <Text style={{
                            color: 'black',
                            fontSize: 20,
                        }}>
                            {!register ? 'Login' : 'Register'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {navigation.navigate('HomePage')}}>
                        <Text style={{
                            color: basicColor, 
                            textDecorationLine: 'underline', 
                            marginTop: 10,
                            fontSize: 20,
                            fontWeight: 'bold'}}>Continue without account</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {setCoPassword(''), setError(''), setRegister(!register)}}>
                        <Text style={{
                            color: basicColor, 
                            textDecorationLine: 'underline', 
                            marginTop: 20,
                            fontWeight:'bold'}}>{!register ? "Don't have an account, Sign UP" : "I have an account, Log In"}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}