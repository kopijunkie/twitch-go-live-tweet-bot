const axios = require("axios");
const FormData = require("form-data");
const Twit = require("twit");
const TwitchJs = require("twitch-js").default;
const { twitchConfig, twitterConfig } = require("./config.js");

const connectToTwitch = () => {
  const data = new FormData();
  data.append("client_id", twitchConfig.client_id);
  data.append("client_secret", twitchConfig.client_secret);
  data.append("grant_type", "client_credentials");

  const config = {
    method: "post",
    url: "https://id.twitch.tv/oauth2/token",
    headers: {
      ...data.getHeaders(),
    },
    data: data,
  };

  axios(config)
    .then((response) => {
      const accessToken = response.data.access_token;
      getChannelInfo(accessToken);
    })
    .catch((error) => {
      console.error("Failed to retrieve Twitch OAuth token:", error);
    });
};

const getChannelInfo = (accessToken) => {
  const twitchUsername = twitchConfig.username;
  const twitchJs = new TwitchJs({
    clientId: twitchConfig.client_id,
    token: accessToken,
    onAuthenticationFailure: () => {
      console.error("* Twitch auth error!");
    },
  });
  // POSSIBLE QUERIES:
  // streams?user_login=${twitchUsername}
  // search/channels?query=${twitchUsername}
  twitchJs.api.get(`search/channels?query=${twitchUsername}`).then(
    (response) => {
      const streamData = response.data[0];
      if (streamData.isLive) {
        postGoLiveTweet(streamData.title);
      } else {
        console.log(`${twitchUsername} is offline...`);
      }
    },
    (error) => {
      console.error("* Twitch auth error!", error);
    }
  );
};

const postGoLiveTweet = (streamTitle = "Gone live!") => {
  const Twitter = new Twit(twitterConfig);
  const twitchURL = `https://www.twitch.tv/${twitchConfig.username}`;
  Twitter.post(
    "statuses/update",
    {
      status: `${streamTitle} Come hang out :)\n${twitchURL}`,
    },
    (err, data, response) => {
      console.log(data);
    }
  );
};

connectToTwitch();
