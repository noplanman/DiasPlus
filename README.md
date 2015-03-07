# DiasPlus

diaspora\* script that adds tweaks to the website.

- Author: [Armando Lüscher](https://diasp.eu/people/c2d5d7b0852901324e075404a6b20780)
- Version: 1.2 ([changelog](https://github.com/noplanman/DiasPlus/blob/master/CHANGELOG.md))
- Short-Link for sharing: https://j.mp/DiasPlus

---

##Installation

DiasPlus can be installed on a **PC**, or a **Mac**.
Simply choose the plugin that corresponds to your web browser below and download the script, as easy as that!

###With Plugin
1. Which browser?
  - **Firefox**: Install the [GreaseMonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) plugin.
  - **Chrome**: Install the [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) plugin.
  - **Opera**: Install the [ViolentMonkey](https://addons.opera.com/en/extensions/details/violent-monkey/) extension.
  - **Safari** & **Internet Explorer**: *NOT SUPPORTED!*

2. DiasPlus script can be found here (just choose any one)
  - [Get it on OpenUserJS.org](https://openuserjs.org/install/noplanman/DiasPlus.user.js)
  - [Get it on GreasyFork](https://greasyfork.org/en/scripts/7789-diasplus/code/DiasPlus.user.js)

3. Add your pod
  - Be sure to update the `MyDiasPlus` variable on line 24 of the script to match your diaspora\* pod!

    (e.g. If you are on the `diasp.eu` pod, simply change the domain to `'diasp.eu'`)
  - (When your script gets auto-updated, this change will have to be made again. I'm working on a solution for this ;-))

##Details

###Header

Adds **Liked** and **Commented** links to the header navigation for easier access.
The background of the selected link gets coloured.

![Additional header links](https://github.com/noplanman/DiasPlus/raw/master/assets/header.png)

###Long-Click-Tags

Easily convert certain words to tags in the text entry field when writing a new post.
If a word is already a tag, convert it back into a normal word.
Simply move the mouse over a word that should be converted into a tag and hold down the mouse button. After half a second the word will be converted into a tag.

Example when long-clicking the word "Tag": `Make me a Tag.` *becomes* `Make me a #Tag.`

###Open on my pod

When directly viewing a user or post from a different pod, there is no easy way of opening the page on your own pod.
This feature helps out with that, by adding a button at the top left, needing only 1 click to open it on your pod.

![Open on my pod](https://github.com/noplanman/DiasPlus/raw/master/assets/open-on-my-pod.png)