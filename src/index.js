const Twit = require("twit");
const TwitchJs = require("twitch-js").default;
const { twitchConfig, twitterConfig } = require("./config.js");

const connectToTwitch = () => {
  // To get a temp token for dev: https://twitchtokengenerator.com/
  // TODO: Get Twitch OAuth Token
  const tempToken = "TWITCH_OAUTH_TOKEN";
  const twitchUsername = twitchConfig.username;
  const twitchJs = new TwitchJs({
    clientId: twitchConfig.client_id,
    token: tempToken,
    onAuthenticationFailure: () => {
      console.error("* Twitch auth error!");
    },
  });
  twitchJs.api.get(`search/channels?query=${twitchUsername}`).then(
    (response) => {
      console.log(response);
      const streamData = response.data[0];
      if (streamData.isLive) {
        postTweet(streamData.title);
      } else {
        console.log(`${twitchUsername} is offline...`);
      }
    },
    (error) => {
      console.error("* Twitch auth error!", error);
    }
  );
};

const postTweet = (streamTitle = "") => {
  const Twitter = new Twit(twitterConfig);
  const twitchURL = `https://www.twitch.tv/${twitchConfig.username}`;
  Twitter.post(
    "statuses/update",
    {
      status: `${streamTitle}...come hang out :)\n${twitchURL}`,
    },
    (err, data, response) => {
      console.log(data);
    }
  );
};

connectToTwitch();
