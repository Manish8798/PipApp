import React, { useState, useRef } from "react";
import { StyleSheet, View, Button, Text, Platform } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

const videoSource =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function VideoScreen() {
  const [isPipActive, setIsPipActive] = useState(false);
  const videoRef = useRef(null);

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.play();
  });

  // Function to Enter PiP Mode
  const enterPictureInPicture = async () => {
    if (Platform.OS === "ios" && videoRef.current) {
      console.log("Entering PiP mode...");
      setIsPipActive(true);
    }
  };

  // Function to Exit PiP Mode (Handled by Event)
  const exitPictureInPicture = () => {
    console.log("Exiting PiP mode...");
    setIsPipActive(false);
  };

  return (
    <View style={styles.contentContainer}>
      <VideoView
        ref={videoRef}
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        onPictureInPictureStart={() => {
          console.log("PIP started");
          setIsPipActive(true);
        }}
        onPictureInPictureStop={exitPictureInPicture} // ✅ Handles exit
      />

      <View style={styles.controlsContainer}>
        <Button title={player.playing ? "Pause" : "Play"} onPress={() => (player.playing ? player.pause() : player.play())} />

        <View style={styles.spacer} />

        <Button
          title={isPipActive ? "Exit PIP" : "Enter PIP"}
          onPress={enterPictureInPicture}
        />

        {isPipActive && <Text style={styles.pipStatus}>PIP Mode Active</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 50,
  },
  video: {
    width: 350,
    height: 275,
  },
  controlsContainer: {
    padding: 10,
    alignItems: "center",
  },
  spacer: {
    height: 10,
  },
  pipStatus: {
    marginTop: 10,
    color: "green",
    fontWeight: "bold",
  },
});
