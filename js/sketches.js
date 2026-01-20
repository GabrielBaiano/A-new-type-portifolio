const SKETCH_GALLERY = {
    'try-drawing': {
        name: 'Try Drawing',
        scale: 1.0,
        isStacked: true,
        wordSpacingY: 100,
        strokes: [
            { color: '#ffffff', paths: [
                // T
                [{ dx: -60, dy: -40 }, { dx: 0, dy: -40 }],
                [{ dx: -30, dy: -40 }, { dx: -30, dy: 40 }, { dx: -15, dy: 35 }],
                // r
                [{ dx: 10, dy: 40 }, { dx: 10, dy: 10 }, { dx: 25, dy: 5 }, { dx: 40, dy: 10 }, { dx: 40, dy: 40 }],
                // y
                [{ dx: 50, dy: 10 }, { dx: 50, dy: 30 }, { dx: 70, dy: 30 }, { dx: 70, dy: 10 }, { dx: 70, dy: 60 }, { dx: 50, dy: 75 }]
            ]},
            { color: '#ec4899', paths: [
                // Heart
                [{ dx: 95, dy: 0 }, { dx: 85, dy: -10 }, { dx: 75, dy: 0 }, { dx: 95, dy: 25 }, { dx: 115, dy: 0 }, { dx: 105, dy: -10 }, { dx: 95, dy: 0 }]
            ]},
            null, // PAGE BREAK / STACK
            { color: '#ffffff', paths: [
                // d
                [{ dx: -100, dy: 40 }, { dx: -130, dy: 40 }, { dx: -130, dy: 10 }, { dx: -100, dy: 10 }, { dx: -100, dy: 40 }, { dx: -100, dy: -20 }],
                // r
                [{ dx: -80, dy: 40 }, { dx: -80, dy: 10 }, { dx: -65, dy: 5 }, { dx: -50, dy: 10 }, { dx: -50, dy: 40 }],
                // a
                [{ dx: -30, dy: 40 }, { dx: 0, dy: 40 }, { dx: 0, dy: 10 }, { dx: -30, dy: 10 }, { dx: -30, dy: 40 }, { dx: 10, dy: 40 }],
                // w
                [{ dx: 25, dy: 10 }, { dx: 25, dy: 40 }, { dx: 45, dy: 40 }, { dx: 45, dy: 20 }, { dx: 65, dy: 40 }, { dx: 85, dy: 40 }, { dx: 85, dy: 10 }],
                // i
                [{ dx: 100, dy: 40 }, { dx: 100, dy: 10 }],
                [{ dx: 100, dy: -5 }, { dx: 100, dy: -3 }],
                // n
                [{ dx: 115, dy: 40 }, { dx: 115, dy: 10 }, { dx: 135, dy: 10 }, { dx: 135, dy: 40 }, { dx: 155, dy: 10 }, { dx: 155, dy: 40 }],
                // g
                [{ dx: 175, dy: 40 }, { dx: 205, dy: 40 }, { dx: 205, dy: 10 }, { dx: 175, dy: 10 }, { dx: 175, dy: 40 }, { dx: 205, dy: 40 }, { dx: 205, dy: 70 }, { dx: 175, dy: 85 }]
            ]}
        ]
    },
    'anime-girl': {
        name: 'Anime Sketch',
        scale: 0.8,
        isStacked: false,
        wordSpacingY: 0,
        strokes: [
            // FACE OUTLINE
            { color: '#ffffff', paths: [
                [{ dx: -30, dy: 80 }, { dx: -60, dy: 50 }, { dx: -70, dy: 0 }, { dx: -60, dy: -40 }, { dx: -30, dy: -70 }, { dx: 30, dy: -70 }, { dx: 60, dy: -40 }, { dx: 70, dy: 0 }, { dx: 60, dy: 50 }, { dx: 30, dy: 80 }, { dx: -30, dy: 80 }]
            ]},
            // HAIR BANGS
            { color: '#ffffff', paths: [
                [{ dx: -40, dy: -70 }, { dx: -20, dy: -20 }, { dx: 0, dy: -70 }],
                [{ dx: 0, dy: -70 }, { dx: 20, dy: -20 }, { dx: 40, dy: -70 }],
                [{ dx: -60, dy: -40 }, { dx: -55, dy: 20 }],
                [{ dx: 60, dy: -40 }, { dx: 55, dy: 20 }]
            ]},
            // EYES
            { color: '#ffffff', paths: [
                // Left Eye
                [{ dx: -45, dy: -10 }, { dx: -25, dy: -10 }, { dx: -25, dy: 20 }, { dx: -45, dy: 20 }, { dx: -45, dy: -10 }],
                [{ dx: -35, dy: 0 }, { dx: -35, dy: 10 }], // Pupil
                // Right Eye
                [{ dx: 25, dy: -10 }, { dx: 45, dy: -10 }, { dx: 45, dy: 20 }, { dx: 25, dy: 20 }, { dx: 25, dy: -10 }],
                [{ dx: 35, dy: 0 }, { dx: 35, dy: 10 }] // Pupil
            ]},
            // HAND
            { color: '#ffffff', paths: [
                [{ dx: -60, dy: 60 }, { dx: -40, dy: 40 }], // Palm
                [{ dx: -40, dy: 40 }, { dx: -35, dy: 25 }], // Finger 1
                [{ dx: -35, dy: 40 }, { dx: -30, dy: 20 }], // Finger 2
                [{ dx: -25, dy: 40 }, { dx: -20, dy: 15 }]  // Finger 3
            ]},
            // DETAILS
            { color: '#ffffff', paths: [
                // Small blush/shading
                [{ dx: -55, dy: 30 }, { dx: -45, dy: 35 }],
                [{ dx: 45, dy: 35 }, { dx: 55, dy: 30 }]
            ]},
            // SIGNATURE / DATE
            { color: '#ffffff', paths: [
                // "770"
                [{ dx: 80, dy: 50 }, { dx: 110, dy: 50 }, { dx: 80, dy: 80 }], // 7
                [{ dx: 95, dy: 50 }, { dx: 125, dy: 50 }, { dx: 95, dy: 80 }], // 7
                [{ dx: 135, dy: 50 }, { dx: 135, dy: 80 }, { dx: 165, dy: 80 }, { dx: 165, dy: 50 }, { dx: 135, dy: 50 }], // 0
                // Date "4/26/24"
                [{ dx: 80, dy: 100 }, { dx: 80, dy: 120 }, { dx: 100, dy: 120 }], // 4
                [{ dx: 90, dy: 100 }, { dx: 90, dy: 130 }], 
                [{ dx: 110, dy: 115 }, { dx: 100, dy: 115 }], // /
                [{ dx: 115, dy: 100 }, { dx: 140, dy: 100 }, { dx: 140, dy: 115 }, { dx: 115, dy: 115 }, { dx: 115, dy: 130 }, { dx: 140, dy: 130 }], // 2
                [{ dx: 155, dy: 100 }, { dx: 155, dy: 130 }, { dx: 180, dy: 130 }, { dx: 180, dy: 115 }, { dx: 155, dy: 115 }, { dx: 180, dy: 115 }, { dx: 180, dy: 100 }, { dx: 155, dy: 100 }] // 6
            ]}
        ]
    }
};
