import React, { useState, useRef } from 'react';
import { StyleSheet, View, Button, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import WebView from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';

export default function VideoScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [currentVideoId, setCurrentVideoId] = useState('');
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const webViewRef = useRef(null);

  // Extract video ID from YouTube URL
  const getYoutubeVideoId = (url) => {
    if (!url) return false;
    // Handle different YouTube URL formats (standard, shortened, embed, etc.)
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : false;
  };
  
  // Create embedded HTML for the YouTube player
  const getYoutubeHTML = (videoId) => {
    if (!videoId) return '<html><body style="background-color: black;"><div style="color:white; text-align:center; padding-top:40%;">Enter a YouTube URL to play video</div></body></html>';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; background-color: black; display: flex; justify-content: center; align-items: center; height: 100%; }
            #player { width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <div id="player"></div>
          <script src="https://www.youtube.com/iframe_api"></script>
          <script>
            var player;
            function onYouTubeIframeAPIReady() {
              player = new YT.Player('player', {
                videoId: '${videoId}',
                playerVars: {
                  'playsinline': 1,
                  'autoplay': 1,
                  'controls': 1,
                  'rel': 0
                },
                events: {
                  'onReady': onPlayerReady,
                  'onStateChange': onPlayerStateChange
                }
              });
            }

            function onPlayerReady(event) {
              event.target.playVideo();
              window.ReactNativeWebView.postMessage(JSON.stringify({type: 'PLAYER_READY'}));
            }
            
            function onPlayerStateChange(event) {
              if (event.data === YT.PlayerState.PLAYING) {
                window.ReactNativeWebView.postMessage(JSON.stringify({type: 'PLAYING'}));
              } else if (event.data === YT.PlayerState.PAUSED) {
                window.ReactNativeWebView.postMessage(JSON.stringify({type: 'PAUSED'}));
              }
            }

            // Handle messages from React Native
            window.addEventListener('message', function(e) {
              const message = e.data;
              switch (message) {
                case 'pause':
                  player.pauseVideo();
                  break;
                case 'play':
                  player.playVideo();
                  break;
              }
            });
          </script>
        </body>
      </html>
    `;
  };

  // Load the video from user input
  const loadVideo = () => {
    const videoId = getYoutubeVideoId(inputUrl);
    
    if (videoId) {
      setCurrentVideoId(videoId);
      setIsVideoLoaded(true);
      setIsPlaying(true);
    } else {
      // Handle invalid URL
      alert('Please enter a valid YouTube URL');
    }
  };

  // Toggle play/pause
  const togglePlayback = () => {
    if (webViewRef.current && isVideoLoaded) {
      webViewRef.current.postMessage(isPlaying ? 'pause' : 'play');
      setIsPlaying(!isPlaying);
    }
  };
  
  // Handle messages from WebView
  const handleWebViewMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'PLAYER_READY') {
        setIsVideoLoaded(true);
      } else if (message.type === 'PLAYING') {
        setIsPlaying(true);
      } else if (message.type === 'PAUSED') {
        setIsPlaying(false);
      }
    } catch (error) {
      console.log('Error parsing WebView message:', error);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={50}
    >
      <StatusBar style="light" />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter YouTube URL"
          placeholderTextColor="#999"
          value={inputUrl}
          onChangeText={setInputUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.loadButton} onPress={loadVideo}>
          <Text style={styles.loadButtonText}>Load</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.videoContainer}>
        <WebView
          ref={webViewRef}
          style={styles.video}
          originWhitelist={['*']}
          source={{ html: getYoutubeHTML(currentVideoId) }}
          javaScriptEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          onMessage={handleWebViewMessage}
          onError={(error) => console.error('WebView error:', error)}
        />
      </View>
      
      {isVideoLoaded && (
        <View style={styles.controlsContainer}>
          <Button 
            title={isPlaying ? "Pause" : "Play"} 
            onPress={togglePlayback} 
            disabled={!isVideoLoaded}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: 40,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#333',
    color: '#fff',
    paddingHorizontal: 15,
    borderRadius: 5,
    fontSize: 16,
  },
  loadButton: {
    backgroundColor: '#FF0000',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginLeft: 10,
    borderRadius: 5,
  },
  loadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  videoContainer: {
    width: '100%',
    height: 275,
    backgroundColor: '#000',
    marginVertical: 20,
  },
  video: {
    flex: 1,
  },
  controlsContainer: {
    padding: 10,
    alignItems: 'center',
  },
});