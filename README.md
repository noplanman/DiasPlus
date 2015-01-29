# DiasPlus

Diaspora\* script that adds tweaks to the website.

- Author: [Armando Lüscher](https://diasp.eu/people/c2d5d7b0852901324e075404a6b20780)
- Version: 1.0 ([changelog](https://github.com/noplanman/DiasPlus/blob/master/CHANGELOG.md))
- Short-Link for sharing: https://j.mp/DiasPlus

---

##Installation

DiasPlus can be installed on a **PC with Windows**, or a **Mac with OSX**.
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
  - Be sure to update '@include' on line 5 of the script to match your Diaspora* pod!
  - (When your script gets auto-updated, this change will have to be made again. I'm working on a solution for this ;-))

##Details

###Header

Adds **Liked** and **Commented** links to the header navigation for easier access.
The background of the selected link gets coloured.

![Additional header links](https://github.com/noplanman/DiasPlus/raw/master/assets/header.png)