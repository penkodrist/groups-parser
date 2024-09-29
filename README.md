# gparse
to install all dependencies `npm install`
# gprase.js
Heavy script for parsing info about group's ids and names. 

**How it works**

Loading every possible id (defaul: 1 - 999) and adding parsed info into JSON. May ban your IP address if too many requests were sent. Default path for JSON file is `output/bincol_groups.json`
# gparse_lite.js
Lite script for the same goal to parse groups' info.

**How it works**

Loading URL with all groups' buttons, taking the text and `href` attribute from them and adding pulled info into JSON. More safe method for parsing info with no risk receiving a ban. Default path for JSON file is `output/bincol_groups.json`
