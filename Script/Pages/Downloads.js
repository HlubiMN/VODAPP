import { 
  View, 
  Platform, 
  StatusBar, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  Modal, 
  Alert, 
  FlatList,
  SafeAreaView, 
  RefreshControl} from 'react-native'
import React, {useState, useEffect} from 'react'
import { Searchbar } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";

//Scripts
import styles from '../styles';
import { searchDisplayVideo } from '../display';
import { deleteVideo } from '../download';

//icons
import { FontAwesome } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

export default function History({navigation}) {

  const isFocused = useIsFocused();
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [downloads, setDownloads] = useState([]);

  const search = (text) => {
    setSearchText(text);
  };

  const retrive = async() => {
    // await AsyncStorage.removeItem('downloads');
    const storedArrayString = await AsyncStorage.getItem('downloads');
    if (storedArrayString !== null){
      const storedArray = storedArrayString ? JSON.parse(storedArrayString) : [];
      setDownloads(storedArray);
    }
    else{
      setDownloads([])
      return;
    }
  }

  const options = (item) => {
    Alert.alert(JSON.stringify(item.name), '', [
      {
        text: 'Watch',
        onPress: () => navigation.navigate('VideoP', {uri: item.videoUri}),
      },
      {
          text: 'Delete', 
          onPress: () => {
            deleteVideo(item);
          }
      },
    ]);
  }

  const onRefresh = React.useCallback(() => { // to refresh the content after leaving the page(MainPage)
    setRefreshing(true);
    const fetchData = async () => {
      retrive();
      setRefreshing(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isFocused){
      retrive();
    }
  }, [isFocused])
  
  return (
    <SafeAreaView style={[styles.screenContainer, {paddingBottom: 60}]}>
      <View style={styles.searchBarAndProfileContainer}>
        <View style={styles.searchBarContainer}>
          <Searchbar
            placeholder="Search..."
            onChangeText={(value_) => search(value_)}
            value={searchText}
          />
        </View>
      </View>

      <FlatList
        data={downloads}
        refreshControl={
          <RefreshControl 
            refreshing = {refreshing}
            onRefresh={onRefresh}
          />
        }
        renderItem={
          ({ 
            item 
          }) => (searchText.length === 0 || item.title.toLowerCase().includes(searchText.toLowerCase())) && (
            <TouchableOpacity onPress={()=> options(item)}>
              {searchDisplayVideo(item)}
            </TouchableOpacity>
          )
        }
      />

      {
        downloads.length === 0 && (
          <View style={{
            justifyContent: 'center', 
            width: '100%', 
            height: '85%', 
            alignItems: 'center'}}>
            <FontAwesome name="download" size={150} color="black" />
            <Text>The is no Downloads available</Text>
          </View>
        )
      }
    </SafeAreaView>
  )
}
