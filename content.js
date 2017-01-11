const BASE_URL = 'https://jons-know.herokuapp.com';

function shareUrl(currentHref, creds) {
  chrome.runtime.sendMessage({"message": "notify", "id": "codaisseurReadingListExtension", "options": {
    type: "basic",
    title: "Sharing Link to Jons Know...",
    message: currentHref,
    iconUrl: "icon-48.png"
  }});


  const rest = feathers.rest(BASE_URL);
  const app = feathers()
    .configure(feathers.hooks())
    .configure(rest.superagent(superagent))
    .configure(feathers.authentication({
      type: 'local'
    }));

  const urlService = app.service('urls');

  return app.authenticate({ email: creds.email, password: creds.password, type: 'local' }).then((response) => {
    return urlService.create({ url: currentHref, tldr: 'Via Chrome extension.' })
      .then((result) => {
        chrome.runtime.sendMessage({"message": "notify", "id": "codaisseurReadingListExtension", "options": {
          type: "basic",
          title: "Thank You!",
          message: "Your link was saved to Jons Know!\n\n" + result.title,
          iconUrl: "icon-48.png"
        }});
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      shareUrl(window.location.href, request.creds).then(result => {
      }).catch(error => {
        if (error.code === 401) {
          chrome.runtime.sendMessage({"message": "open_new_tab", "url": BASE_URL + '/sign-in'});
        }
        console.error(error);
      });
    }
  }
);
