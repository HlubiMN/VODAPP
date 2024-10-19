import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Image, Modal, Button, ActivityIndicator, RefreshControl } from 'react-native'
import React, {useState, useEffect} from 'react'

import { Searchbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref as databaseRef, get, child } from 'firebase/database';
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from "firebase/storage";

import styles from '../styles.js'
import {database, firebase} from '../config.js'

export default function MainPage({navigation}) {

  const [viewImage, setViewImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [details, setDetails] = useState([]);
  const [genre, setGenres] = useState('');
  const [trailerList, setTrailerList] = useState([]);
    // [
    //   {
    //     ID: 1, 
    //     genre: 'action' , 
    //     trailers: [
    //       { 
    //         identifier : '0001', 
    //         name: 'trailer name', 
    //         videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    //         trailerUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' 
    //       },
    //       { 
    //         identifier : '0002', 
    //         name: 'trailer name', 
    //         videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    //         trailerUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' 
    //       },
    //       { 
    //         identifier : '0003', 
    //         name: 'trailer name', 
    //         videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    //         trailerUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' 
    //       },
    //       { 
    //         identifier : '0004', 
    //         name: 'trailer name', 
    //         videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    //         trailerUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' 
    //       },
    //       { 
    //         identifier : '0005', 
    //         name: 'trailer name', 
    //         videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    //         trailerUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' 
    //       },
    //     ]
    //   },
    //   {
    //     ID: 2, 
    //     genre: 'drama' , 
    //     trailers: [
    //       { 
    //         identifier : '0001', 
    //         name: 'trailer name', 
    //         videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    //         trailerUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' 
    //       },
    //       { 
    //         identifier : '0002', 
    //         name: 'trailer name', 
    //         videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    //         trailerUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' 
    //       },
    //       { 
    //         identifier : '0003', 
    //         name: 'trailer name', 
    //         videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    //         trailerUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' 
    //       },
    //       { 
    //         identifier : '0004', 
    //         name: 'trailer name', 
    //         videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    //         trailerUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' 
    //       },
    //       { 
    //         identifier : '0005', 
    //         name: 'trailer name', 
    //         videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    //         trailerUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' 
    //       },
    //     ]
    //   },
    //   {
    //     ID: 3, 
    //     genre: 'romence' , 
    //     trailers: [
    //       { 
    //         identifier : '0001', 
    //         name: 'trailer name', 
    //         videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    //         trailerUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' 
    //       },
    //       { 
    //         identifier : '0002', 
    //         name: 'trailer name', 
    //         videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    //         trailerUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4'  
    //       },
    //       { 
    //         identifier : '0003', 
    //         name: 'trailer name', 
    //         videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    //         trailerUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' 
    //       },
    //       { 
    //         identifier : '0004', 
    //         name: 'trailer name', 
    //         videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    //         trailerUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' 
    //       },
    //       { 
    //         identifier : '0005', 
    //         name: 'trailer name', 
    //         videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    //         trailerUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4'  
    //       },
    //     ]
    //   },
    //   {
    //     ID: 4, 
    //     genre: 'sci-fi' , 
    //     trailers: [
    //       { 
    //         identifier : '0001', 
    //         name: 'trailer name', 
    //         videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    //         trailerUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' 
    //       },
    //       { 
    //         identifier : '0002', 
    //         name: 'trailer name', 
    //         videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    //         trailerUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4'  
    //       },
    //       { 
    //         identifier : '0003', 
    //         name: 'trailer name', 
    //         videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    //         trailerUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4'  
    //       },
    //       { 
    //         identifier : '0004', 
    //         name: 'trailer name', 
    //         videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    //         trailerUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' 
    //       },
    //       { 
    //         identifier : '0005', 
    //         name: 'trailer name', 
    //         videoUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    //         trailerUri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' 
    //       },
    //     ]
    //   }
    // ]);


  const setNewDetails = async(items, folderTitle) => {
    // await AsyncStorage.removeItem('History')
    // const value = await AsyncStorage.getItem('History');
    // console.log(items.imageUri.split("?")[0]);
    storeHistory(items, folderTitle);
    setDetails([])
    const newDetails = [...details, items];
    setDetails(newDetails);
    setGenres(folderTitle)
    setViewImage(true);
  }

  const storeHistory = async (items, folderTitle) => {
    try {
      const value = await AsyncStorage.getItem('History');
      if (value !== null) {
        let newDetails = JSON.parse(value);
        for (let i = 0; i < newDetails.length; i++) {
          if(newDetails[i].name === items.name && newDetails[i].folderTitle === folderTitle) {
            newDetails[i].dateWatched = new Date().getFullYear().toString() + '-' + new Date().getMonth().toString() + '-' + new Date().getDate().toString();
            newDetails[i].timeWatched = new Date().getHours().toString() + ':' + new Date().getMinutes().toString();
            await AsyncStorage.setItem(
              'History',
              JSON.stringify(newDetails),
            );
            return;
          }
        }
        let newItem = {
          folderTitle: folderTitle,
          name: items.name, 
          videoUri: items.videoUri,
          imageUri: items.imageUri,
          dateWatched: new Date().getFullYear().toString() + '-' + new Date().getMonth().toString() + '-' + new Date().getDate().toString(),
          timeWatched: new Date().getHours().toString() + ':' + new Date().getMinutes().toString()
        }
        newDetails.push(newItem);
        await AsyncStorage.setItem('History', JSON.stringify(newDetails));
        return;
      }
      else{
        let newDetails = [{
          folderTitle: folderTitle,
          name: items.name, 
          videoUri: items.videoUri,
          imageUri: items.imageUri,
          dateWatched: new Date().getFullYear().toString() + '-' + new Date().getMonth().toString() + '-' + new Date().getDate().toString(),
          timeWatched: new Date().getHours().toString() + ':' + new Date().getMinutes().toString()
        }];
        await AsyncStorage.setItem(
          'History',
          JSON.stringify(newDetails),
        );
        return;
      }
    } catch (error) {
      console.error(error.message);
    }
  };

// network call functions to get videos from the server (not completed yet)

  const isImage = (itemName) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif"]; // Add more extensions if needed
    const extension = itemName.substring(itemName.lastIndexOf(".")).toLowerCase();
    return imageExtensions.includes(extension);
  };

  const getAllFolders = async () => { // get the folder containing the videos which are genres
    const storage = getStorage();
    const listRef = ref(storage, 'Movies');
    try {
      const res = await listAll(listRef);
      return res.prefixes.map((folderRef) => ({
        genre: folderRef._location.path_,
        trailers: []
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const getAllVideoItems = async (folders) => { // get the folder named after the movie or video which contains the movie
    const storage = getStorage();
    const updatedFolders = await Promise.all(folders.map(async (folder) => {
      const listRef = ref(storage, folder.genre);
      try {
        const res = await listAll(listRef);
        const videoItems = await Promise.all(res.prefixes.map(async (folderRef) => {
          return {
            path: folderRef._location.path_,
            name: folderRef._location.path_.split("/").pop(),
            imageUri: '',
            trailerUri: '',
            videoUri: '',
            date:0
          };
        }));
        return { ...folder, trailers: [...folder.trailers, ...videoItems] };
      } catch (error) {
        console.error(error);
        return folder;
      }
    }));
    return updatedFolders;
  };

  const getAllUri = async (folders) => { // get all the uri for movies, trailers and image/thumbnail of the movie
    const storage = getStorage();
    const updatedFolders = await Promise.all(folders.map(async (folder) => {
      const updatedContainers = await Promise.all(folder.trailers.map(async (container) => {
        const listRef = ref(storage, container.path);
        try {
          const res = await listAll(listRef);
          await Promise.all(res.items.map(async (item) => {
            const url = await getDownloadURL(item);
            if (isImage(item.name)) {
              container.imageUri = url;
              console.log(url)
            } else if (item.name.toLocaleLowerCase() === 'trailer.mp4') {
              container.trailerUri = url;
            } else {
              container.videoUri = url;
            }
          }));
          return container;
        } catch (error) {
          console.error(error);
          return container;
        }
      }));
      return { ...folder, trailers: updatedContainers };
    }));
    return updatedFolders;
  };

  const getFileMetadata = async (folder) => { // get date and time of when the folder containing the movie, trailer and imge where last updated
    const storage = getStorage()
    
    const updatedFolders = await Promise.all(folder.map(async (folder) => {
      const updatedContainers = await Promise.all(folder.trailers.map(async (container) => {
        const listRef = ref(storage, container.path);
        try {
          const res = await listAll(listRef);
          await Promise.all(res.items.map(async (item) => {
            const metadata = await getMetadata(item);
            const meta = metadata.timeCreated.split('-');
            meta[meta.length - 1] = meta[meta.length - 1].split('T')[0];
            container.date = parseInt(meta[0]+meta[1]+meta[2]);
          }));
          return container;
        } catch (error) {
          console.error(error);
          return container;
        }
      }));
      return { ...folder, trailers: updatedContainers };
    }));
    return updatedFolders;
    
  }

  const onRefresh = React.useCallback(() => { // to refresh the content after leaving the page(MainPage)
    setRefreshing(true);
    const fetchData = async () => {
      try {
        const folders = await getAllFolders();
        const foldersWithVideos = await getAllVideoItems(folders);
        const foldersWithUri = await getAllUri(foldersWithVideos);
        setTrailerList(foldersWithUri);
        setRefreshing(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const folders = await getAllFolders();
        const foldersWithVideos = await getAllVideoItems(folders);
        const foldersWithUri = await getAllUri(foldersWithVideos);
        // getFileMetadata(foldersWithUri)
        setTrailerList(foldersWithUri);
        setLoading(false)
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
    
  }, []);

  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.searchBarAndProfileContainer}>
        <View style={styles.searchBarContainer}>
          <Searchbar
            placeholder="Search..."
            onChangeText={(value_) =>  setSearchText(value_)}
            value={searchText}/>
        </View>
      </View>

      {loading && (
        <View style={{width:'100%', height:'100%', justifyContent:'center'}}>
          <ActivityIndicator size='large' color="black" />
        </View>
      )}

      {searchText.length === 0 && (<FlatList
        data={trailerList}
        refreshControl={
          <RefreshControl 
            refreshing = {refreshing}
            onRefresh={onRefresh}
          />
        }
        renderItem={
          ({ 
            item 
          }) => (
            <View style={styles.flatlistViewVertical}>
              <Text style={{fontSize: 25, color:'black'}}>{item.genre.split('/').pop()}</Text>
              <FlatList
                horizontal
                data={item.trailers}
                renderItem={
                ({ 
                  item: each
                }) => (
                  <View style={styles.videoContainerStyle}>
                    <TouchableOpacity onPress={() => setNewDetails(each, item.genre.split('/').pop())}>
                      <Image
                        style={styles.videoImage}
                        source={{uri: each.imageUri}}/>
                    </TouchableOpacity>
                  </View>
                  )
                }
              />
            </View>
          )
        }
      />)}

      {searchText.length > 0 && (<FlatList
        data={trailerList}
        renderItem={
          ({ 
            item 
          }) => (
            <FlatList
              data={item.trailers}
              renderItem={
                ({
                  item: each
                }) => item.name.toLowerCase().includes(searchText.toLowerCase()) && (
                  <View style={{backgroundColor:'grey', margin: 10, borderRadius: 10}}>
                    <TouchableOpacity onPress={() => setNewDetails(each, item.genre)}>
                      <View style={{flexDirection: 'row', marginVertical: 10, marginLeft: 10}}>
                        <View style={{width:100, height:100}}>
                          <Image
                            style={{width: '100%', height: '100%', borderRadius: 10}}
                            source={require('../../Pictures/testImage.png')}/>
                        </View>
                        <View style={{marginLeft: 20}}>
                          <Text style={{fontSize: 20, color:'white'}}>{item.name}</Text>
                          <Text style={{fontSize: 15, color:'white'}}>Other information</Text>
                          <Text style={{fontSize: 15, color:'white'}}>Other information</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                )
              }
            />
          )
        }
      />)}

      <Modal
        animationType="slide"
        transparent={false}
        visible={viewImage}
        onRequestClose={() => {
          setViewImage(!viewImage);
        }}>
          <TouchableOpacity onPress={() => [setViewImage(false), navigation.navigate('VideoOptions', {details: details[0], folder: genre})]}>
            <Image
              style={{width:'100%',height: '100%'}}
              source={details.length === 0 ? require('../../Pictures/picture_2.jpg') : {uri: details[0].imageUri}}/>
    
            <View style={styles.overlayingContainer}> 
              <Button title='continue' onPress={() => [setViewImage(false), navigation.navigate('VideoOptions', {details: details[0], folder: genre})]} color="#003020" />
            </View>
          </TouchableOpacity>
      </Modal> 
    </SafeAreaView>
  )
}