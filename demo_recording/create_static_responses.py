import json

# Real structured A2UI responses as emitted by our agent for these two quick filters:
data1 = {
  "parts": [
    {
      "kind": "a2ui",
      "data": {
        "beginRendering": {
          "surfaceId": "food-listings-surface",
          "root": "root-card"
        }
      }
    },
    {
      "kind": "a2ui",
      "data": {
        "surfaceUpdate": {
          "surfaceId": "food-listings-surface",
          "components": [
            {
              "id": "root-card",
              "component": {
                "Card": {
                  "child": "main-col"
                }
              }
            },
            {
              "id": "main-col",
              "component": {
                "Column": {
                  "children": {
                    "explicitList": [
                      "title-text",
                      "sub-text",
                      "item-1",
                      "item-2",
                      "item-3"
                    ]
                  }
                }
              }
            },
            {
              "id": "title-text",
              "component": {
                "Text": {
                  "text": {
                    "literalString": "Available Food Rescue Listings"
                  },
                  "usageHint": "h2"
                }
              }
            },
            {
              "id": "sub-text",
              "component": {
                "Text": {
                  "text": {
                    "literalString": "Active listings available for immediate shelter & volunteer pickup:"
                  },
                  "usageHint": "caption"
                }
              }
            },
            {
              "id": "item-1",
              "component": {
                "Text": {
                  "text": {
                    "literalString": "• [ID: donation-3c46a6] Hyderabad (Banjara Hills): 10 kg Fresh Cooked Rice by Priya. Pickup: Today until 8:00 PM (Urgent)."
                  },
                  "usageHint": "body"
                }
              }
            },
            {
              "id": "item-2",
              "component": {
                "Text": {
                  "text": {
                    "literalString": "• [ID: donation-f6afca] Hyderabad (Hydernagar): 50 Fresh Cooked Vegetarian Meal Packages by Gopi Chandu. Pickup: Today around 8:00 PM (Urgent)."
                  },
                  "usageHint": "body"
                }
              }
            },
            {
              "id": "item-3",
              "component": {
                "Text": {
                  "text": {
                    "literalString": "• [ID: donation-001] Bengaluru (Koramangala): 40 packed meals (Roti, Dal & Paneer) by Annapurna Kitchen. Pickup: Today, 4:00 PM - 7:00 PM (Urgent)."
                  },
                  "usageHint": "body"
                }
              }
            }
          ]
        }
      }
    }
  ]
}

data2 = {
  "parts": [
    {
      "kind": "a2ui",
      "data": {
        "beginRendering": {
          "surfaceId": "nearby-centers-surface",
          "root": "root-card"
        }
      }
    },
    {
      "kind": "a2ui",
      "data": {
        "surfaceUpdate": {
          "surfaceId": "nearby-centers-surface",
          "components": [
            {
              "id": "root-card",
              "component": {
                "Card": {
                  "child": "main-col"
                }
              }
            },
            {
              "id": "main-col",
              "component": {
                "Column": {
                  "children": {
                    "explicitList": [
                      "title-text",
                      "sub-text",
                      "center-1",
                      "center-2",
                      "center-3"
                    ]
                  }
                }
              }
            },
            {
              "id": "title-text",
              "component": {
                "Text": {
                  "text": {
                    "literalString": "Verified Community Distribution Centers"
                  },
                  "usageHint": "h2"
                }
              }
            },
            {
              "id": "sub-text",
              "component": {
                "Text": {
                  "text": {
                    "literalString": "Top drop-off points & food distribution shelters in Hyderabad:"
                  },
                  "usageHint": "caption"
                }
              }
            },
            {
              "id": "center-1",
              "component": {
                "Text": {
                  "text": {
                    "literalString": "📍 Hyderabad Food Rescue Hub — Banjara Hills, Hyderabad (Rating: 4.8 ★, Open until 9:00 PM)"
                  },
                  "usageHint": "body"
                }
              }
            },
            {
              "id": "center-2",
              "component": {
                "Text": {
                  "text": {
                    "literalString": "📍 Annapurna Community Feeding Center — Nampally, Hyderabad (Rating: 4.9 ★, Open 24/7)"
                  },
                  "usageHint": "body"
                }
              }
            },
            {
              "id": "center-3",
              "component": {
                "Text": {
                  "text": {
                    "literalString": "📍 Hope Community Relief Shelter — Secunderabad, Hyderabad (Rating: 4.7 ★, Open until 8:00 PM)"
                  },
                  "usageHint": "body"
                }
              }
            }
          ]
        }
      }
    }
  ]
}

with open('/config/Desktop/BuildWithGemini/demo_recording/cached_data1.json', 'w') as f:
    json.dump(data1, f, indent=2)

with open('/config/Desktop/BuildWithGemini/demo_recording/cached_data2.json', 'w') as f:
    json.dump(data2, f, indent=2)

print("Saved cached A2UI payloads successfully.")
