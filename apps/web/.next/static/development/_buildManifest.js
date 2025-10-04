self.__BUILD_MANIFEST = {
  "__rewrites": {
    "afterFiles": [],
    "beforeFiles": [
      {
        "has": [
          {
            "type": "host",
            "value": "(?<tenant>.*)\\.mindsp\\.fr"
          }
        ],
        "source": "/:path*",
        "destination": "/:path*?tenant=:tenant"
      }
    ],
    "fallback": []
  },
  "sortedPages": [
    "/_app",
    "/_error"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()