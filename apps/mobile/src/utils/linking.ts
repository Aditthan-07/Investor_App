import * as Linking from "expo-linking";

export const linkingConfig = {
  prefixes: [Linking.createURL("/"), "finsight://"],
  config: {
    screens: {
      "(tabs)": {
        screens: {
          index: "",
          market: "market",
          chat: "chat",
        },
      },
      guided: {
        screens: {
          health: "guided/health",
          strategy: "guided/strategy",
          breakdown: "guided/breakdown",
        },
      },
    },
  },
};
