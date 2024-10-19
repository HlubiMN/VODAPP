import { 
  View, 
  Platform, 
  StatusBar, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  Modal, 
  FlatList,
  SafeAreaView, 
  RefreshControl } from 'react-native'
import React, {useState, useEffect} from 'react'
import { Searchbar } from 'react-native-paper';
import AsyncStorage from "@react-native-async-storage/async-storage";

//Scripts
import styles from '../styles';
import { searchDisplayTextH, searchDisplayVideoH } from '../display';
// import { downloadText } from '../downloadProcess';

//icons
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { registerRootComponent } from 'expo';

export default function History({navigation}) {

  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  // const [viewItem, setViewItem] = useState(false);
  const [details, setDetails] = useState([]);
  const [history, setHistory] = useState([]);

  const search = (text) => {
    setSearchText(text);
  };
  
  const setNewDetails = (items) => {
    if (details.length > 0) {
        setDetails([]);
    }
    const newDetails = [...details, items];
    setDetails(newDetails);
    setViewItem(true);
  }

  const retrive = async() => {
    const storedArrayString = await AsyncStorage.getItem('History');
    if (storedArrayString !== null){
      const storedArray = storedArrayString ? JSON.parse(storedArrayString) : [];
      setHistory(storedArray);
    }
    else{
      setHistory([])
      return;
    }
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
      {history.length !== 0 && (<View style={styles.searchBarAndProfileContainer}>
        <View style={styles.searchBarContainer}>
          <Searchbar
            placeholder="Search..."
            onChangeText={(value_) => search(value_)}
            value={searchText}
          />
        </View>
      </View>)}

      <FlatList
        data={history}
        refreshControl={
          <RefreshControl 
            refreshing = {refreshing}
            onRefresh={onRefresh}
          />
        }
        renderItem={
          ({ 
            item 
          }) => (searchText.length === 0 || item.name.toLowerCase().includes(searchText.toLowerCase())) && (
            <TouchableOpacity onPress={()=> {navigation.navigate('VideoP', {uri: item.videoUri})}}>
              {searchDisplayVideoH(item)}
            </TouchableOpacity>
          )
        }
      />

      {history.length !== 0 && (<View style={{ alignItems:'center', margin: 20}}>
        <TouchableOpacity onPress={async () => {
          await AsyncStorage.removeItem('History');
          onRefresh()
        }}>
          <Text style={{paddingHorizontal: 20, paddingVertical: 5, fontSize: 15, borderWidth:1, textDecorationLine: 'underline'}}>Clear History</Text>
        </TouchableOpacity>
      </View>)}

      {
        history.length === 0 && (
          <View style={{
            justifyContent: 'center', 
            width: '100%', 
            height: '85%', 
            alignItems: 'center'}}>
            <MaterialCommunityIcons name="history" size={150} color="black" />
            <Text>The is no history available</Text>
          </View>
        )
      }
    </SafeAreaView>
  )
}
