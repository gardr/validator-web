module.exports = [
  {
    "name": "mobil-vg",
    "logo": "/logo.png",
    "config": {
       "sizes": {
            "thresholdBytes": 200000,
            "testvar": 37777
        }
    },
    "formats": [
    {
        "viewport": {
            "width": 468, //default max width
            "height": 300 //default max height
        },
        "height": {
            "min": 200,
            "max": 300
        },
        "width": 468,
        "config": {
            "sizes": {
                "thresholdBytes": 50000
            }
        }
    },
    {
        "height": 200,
        "width": 468
    },
    {
        "height": 150,
        "width": 468
    },
    {
        "height": 225,
        "width": "100%"
    }
    ]
  }
];
