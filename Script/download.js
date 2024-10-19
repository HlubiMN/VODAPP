import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const downloadFromUrl = async (item, foldername) => {
    const filename = `${item.name}.mp4`;
    const result = await FileSystem.downloadAsync(
        item.videoUri,
        FileSystem.documentDirectory + filename
    );
    console.log(result);
    console.log(result.uri);
    download(item, foldername, result.uri)

    // save(result.uri, filename, result.headers["content-type"]);
};

const save = async (uri, filename, mimetype) => {
    if (Platform.OS === "android") {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        console.log(permissions)
        if (permissions.granted) {
            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
            await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, filename, mimetype)
                .then(async (uri) => {
                    await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
                })
                .catch(e => console.log(e));
        } else {
            shareAsync(uri);
        }
    } else {
        shareAsync(uri);
    }
};

const download = async (details, foldername) => {
    try {
        const storedArrayString = await AsyncStorage.getItem('downloads');
        let storedArray = storedArrayString ? JSON.parse(storedArrayString) : [];
        for (let i = 0; i < storedArray.length; i++) {
            if(storedArray[i].name === details.name && storedArray[i].foldername === foldername) {
                console.log('Download', 'File already exists:' + FileSystem.documentDirectory + details.name) 
                return;
            }
        }
        const result = await FileSystem.downloadAsync(
            details.videoUri,
            FileSystem.documentDirectory + `${details.name}.mp4`
        );
        const downloadImage = await FileSystem.downloadAsync(
            details.imageUri,
            FileSystem.documentDirectory + `${details.name}.png`

        );
        console.log(result)

        let newItem = {
            foldername: foldername,
            name: details.name, 
            videoUri: result.uri, 
            imageUri: downloadImage.uri,
            downloadDate: new Date().getFullYear().toString() + '-' + new Date().getMonth().toString() + '-' + new Date().getDate().toString(),
        }

        storedArray.push(newItem);
        const updatedArrayString = JSON.stringify(storedArray);
        await AsyncStorage.setItem('downloads', updatedArrayString);
        console.log('Download', 'Successfully Downloaded '+ details.name);
    } catch (e) {
        console.log('getDownloadable' + e);
    }
};

const deleteVideo = async (items) => {
    try {
        const storedArrayString = await AsyncStorage.getItem('downloads');
        
        let storedArray = JSON.parse(storedArrayString)
        for (let i = 0; i < storedArray.length; i++) {
            if (items.foldername.toLowerCase().includes(storedArray[i].foldername.toLowerCase())){
                try {
                    await FileSystem.deleteAsync(items.videoUri, { idempotent: true });
                    storedArray.splice(i, i + 1)
                    await AsyncStorage.setItem('downloads', JSON.stringify(storedArray));
                    console.log('Video deleted successfully');
                    break;
                } catch (error) {
                    console.error('Error deleting video:', error);
                }  
            }
        }

        
    } catch (error) {
        console.error('Error adding value:', error);
    }
};

export {download, deleteVideo };