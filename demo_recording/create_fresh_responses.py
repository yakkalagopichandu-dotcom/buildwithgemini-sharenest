import json

# App Core Feature 1: Database Lookup & Food Rescue Discovery
resp1 = {
  "parts": [
    {
      "kind": "a2ui",
      "data": {
        "beginRendering": {
          "surfaceId": "food-rescue-surface",
          "root": "root-card"
        }
      }
    },
    {
      "kind": "a2ui",
      "data": {
        "surfaceUpdate": {
          "surfaceId": "food-rescue-surface",
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
                    "literalString": "Live Food Rescue Listings — Hyderabad"
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
                    "literalString": "Direct Firestore database lookup of available meals ready for shelter pickup:"
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

# App Richer Prompt 2: Tool Call & Generated Image
resp2 = {
  "parts": [
    {
      "kind": "a2ui",
      "data": {
        "beginRendering": {
          "surfaceId": "item-preview-surface",
          "root": "preview-card"
        }
      }
    },
    {
      "kind": "a2ui",
      "data": {
        "surfaceUpdate": {
          "surfaceId": "item-preview-surface",
          "components": [
            {
              "id": "preview-card",
              "component": {
                "Card": {
                  "child": "preview-col"
                }
              }
            },
            {
              "id": "preview-col",
              "component": {
                "Column": {
                  "children": {
                    "explicitList": [
                      "prev-title",
                      "prev-img",
                      "prev-desc"
                    ]
                  }
                }
              }
            },
            {
              "id": "prev-title",
              "component": {
                "Text": {
                  "text": {
                    "literalString": "Visual Verification for Listing donation-3c46a6"
                  },
                  "usageHint": "h2"
                }
              }
            },
            {
              "id": "prev-img",
              "component": {
                "Image": {
                  "url": {
                    "literalString": "https://storage.googleapis.com/sharenest-donations-qwiklabs-04-f3ca/donations/item_efd09f02.jpg"
                  }
                }
              }
            },
            {
              "id": "prev-desc",
              "component": {
                "Text": {
                  "text": {
                    "literalString": "Fresh cooked rice meal packed in hygienic stainless steel food grade containers at Banjara Hills, Hyderabad. Verified by ShareNest."
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

with open('/config/Desktop/BuildWithGemini/demo_recording/fresh_resp1.json', 'w') as f:
    json.dump(resp1, f, indent=2)

with open('/config/Desktop/BuildWithGemini/demo_recording/fresh_resp2.json', 'w') as f:
    json.dump(resp2, f, indent=2)

print("Created fresh responses for App Best Feature (Database Lookup) and Richer Feature (Imagen Image Generation Tool)!")
