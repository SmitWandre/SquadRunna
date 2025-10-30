import { registerRootComponent } from "expo";
import { Text, View } from "react-native";

function TestApp() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 24, color: "#000" }}>Test App Works!</Text>
    </View>
  );
}

registerRootComponent(TestApp);
