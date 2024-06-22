# chrome-reloader

A chrome extension for reloading background tabs. Chrome Reloader
is available for free from the Chrome Web Store
[here](https://chromewebstore.google.com/detail/chrome-reloader/mfagpbmhgeaimiopngnimamnghchgiml?authuser=0&hl=en).

## Features

Chrome Reloader is a simple chrome extension that reloads background
tabs on a schedule. This is useful for preventing login timeouts for
websites that you visit sporadically throughout your session.

### Setting a Reload Schedule for a Site

To set a reload schedule for a site click on the Chrome Reloader
extension icon when visiting that site. This will bring up a dialog
box that allows you to set the interval and wobble for the site. Both
of these values are specified in seconds. The interval defines the
time between reloads. The value must be >= 60 seconds. The wobble
defines a range for a random amount to subtract from the interval to
determine the next reload time. The wobble value must be in the range
of [0, interval].

To make this more explicit, consider a setting for
a site with an interval of 300 and wobble of 60. This would have each
reload taking place randomly from 240 to 300 seconds (4 to 5 minutes).
Alternatively, consider a setting for a site with an interval of 300
and a wobble of 0. This would have each reload taking place at exactly
5 minutes.

### Seeing all Settings

To see all site settings that you have defined you can go to the
Chrome Reloader options page. This page can be accessed in a couple
of ways. The dialog box that pops up from clicking the Chrome Reloader
extension icon has an "Open Full Options Page" link. Alternatively,
the extensions menu has a triple dot menu next to the Chrome Reloader
link that allows you to select the options page.

The options page shows the complete list of sites that you have
defined reloads for along with the interval and wobble values for
those sites. Sites can be added and removed from the options page.
The options page also allows the submission of additions and
modifications in a batch update.


