const isDev = process.env.NODE_ENV === "development";

const userAgent =
  "Mozilla/5.0 (Macintosh; ; ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36";

const signInURL =
  "https://accounts.google.com/signin/v2/identifier?service=wise&passive=true&continue=http%3A%2F%2Fchat.google.com%2F%3Futm_source%3Den&utm_medium=button&utm_campaign=web&utm_content=gotodrive&usp=gtd&ltmpl=drive&flowName=GlifWebSignIn&flowEntry=ServiceLogin";

const osPlatform = process.platform;

module.exports = {
  isDev,
  userAgent,
  signInURL,
  osPlatform,
};
