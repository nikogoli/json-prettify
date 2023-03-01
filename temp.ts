import { stringify } from "./simplestringify.ts"

const J ={
  "skins": {
    "White": {
      "Arm": {
        "Arm": {
          "name": "arm", "path": "White/arm", "x": 21.18, "y": 21.04,
          "rotation": 109.17, "width": 111, "height": 98
        }
      },
      "Body": {
        "body": {
          "path": "White/body", "x": 23.73, "y": 7.21, "rotation": -89.52, "width": 91, 
          "height": 103
        }
      },
      "Eyes": {
        "Blink": {
          "path": "White/eyes blink", "x": 10.41, "y": 31.16, "rotation": -1.13,
          "width": 67, "height": 22
        },
        "Open": {
          "path": "White/eyes", "x": 11.07, "y": 26.12, "rotation": -4.55, "width": 67,
          "height": 31
        }
      }
    }
	}
}

const L = {
  "bones": {
			"Arm": {
				"rotate": [
					{ "time": 0, "angle": -10.02, "curve": [ 0.25, 0, 0.75, 1 ] },
					{ "time": 0.3333, "angle": -50.06 },
					{ "time": 0.4666, "angle": -29.45, "curve": "stepped" },
					{ "time": 0.6, "angle": -29.45, "curve": [ 0.25, 0, 0.75, 1 ]},
					{ "time": 0.8333, "angle": -10.02 }
				],
				"translate": [
					{ "time": 0, "x": 0, "y": 0,"curve": [ 0.25, 0, 0.75, 1 ]},
					{ "time": 0.3333, "x": 2.53, "y": -1.01 },
					{ "time": 0.4666, "x": -5.05, "y": -2.57, "curve": "stepped" },
					{ "time": 0.6,"x": -5.05, "y": -2.57, "curve": [ 0.25, 0, 0.75, 1 ]}
				]
			},
			"Root": {
				"rotate": [{ "time": 0, "angle": 0 }],
				"translate": [{ "time": 0, "x": 0, "y": 0 }]
			},
			"Head": {
				"rotate": [
					{ "time": 0, "angle": 0, "curve": [ 0.25, 0, 0.75, 1 ] },
					{ "time": 0.3333, "angle": 19.17 },
					{ "time": 0.4666, "angle": -2.33 }
				],
				"translate": [
					{ "time": 0, "x": 0, "y": 0, "curve": [ 0.25, 0, 0.75, 1 ] },
					{ "time": 0.3333, "x": -1.36, "y": -0.46 }
				]
			},
			"Weapon": {
				"rotate": [{"time": 0, "angle": 0}],
				"translate": [{"time": 0, "x": 0, "y": 0}]
			}
		},
		"events": [{ "time": 0.4333, "name": "Hit" }]
}

const unexpectedNewLine = {
  "SCRIPT": [
    {"childs": null, "parent": "P", "fileName": "ドラブロ"},
    {"childs": null, "parent": "DIV", "fileName": "ドラブロ"}
  ],
  "LABEL": [{"childs": null, "parent": "DIV", "fileName": "ドラブロ", "className": "toc_toggle"}],
  "TEXTAREA": [
    {"childs": null, "parent": "DIV", "fileName": "ドラブロ", "className": "crayon-plain print-no"}
  ]
}


console.log(stringify(unexpectedNewLine))