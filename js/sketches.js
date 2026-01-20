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
    },
    'misato': {
        name: 'Misato Katsuragi',
        scale: 0.6,
        isStacked: false,
        wordSpacingY: 0,
        strokes: [
            // 1. BASE HAIR (DARK PURPLE)
            { color: '#312e44', size: 30, brushType: 'standard', paths: [
                [{ dx: 0, dy: -250 }, { dx: -100, dy: -200 }, { dx: -150, dy: -50 }, { dx: -140, dy: 150 }, { dx: 140, dy: 150 }, { dx: 150, dy: -50 }, { dx: 100, dy: -200 }, { dx: 0, dy: -250 }]
            ]},
            // 2. SKIN BASE (TAN)
            { color: '#d2a68e', size: 30, brushType: 'standard', paths: [
                // Face
                [{ dx: 0, dy: -80 }, { dx: -70, dy: -60 }, { dx: -80, dy: 20 }, { dx: 0, dy: 90 }, { dx: 80, dy: 20 }, { dx: 70, dy: -60 }, { dx: 0, dy: -80 }],
                // Neck/Shoulders
                [{ dx: -30, dy: 90 }, { dx: -120, dy: 150 }, { dx: 120, dy: 150 }, { dx: 30, dy: 90 }],
                // Legs
                [{ dx: -70, dy: 450 }, { dx: -100, dy: 800 }, { dx: -20, dy: 800 }, { dx: 0, dy: 450 }],
                [{ dx: 70, dy: 450 }, { dx: 100, dy: 800 }, { dx: 20, dy: 800 }, { dx: 0, dy: 450 }]
            ]},
            // 3. SHIRT BASE (OLIVE GREEN)
            { color: '#555d42', size: 30, brushType: 'standard', paths: [
                [{ dx: -130, dy: 150 }, { dx: -160, dy: 250 }, { dx: -160, dy: 400 }, { dx: 160, dy: 400 }, { dx: 160, dy: 250 }, { dx: 130, dy: 150 }, { dx: -130, dy: 150 }]
            ]},
            // 4. PANTS BASE (OFF-WHITE)
            { color: '#e5e0d4', size: 25, brushType: 'standard', paths: [
                [{ dx: -80, dy: 400 }, { dx: -110, dy: 450 }, { dx: 110, dy: 450 }, { dx: 80, dy: 400 }, { dx: -80, dy: 400 }]
            ]},
            // 5. BLACK OUTLINES (THIN)
            { color: '#111111', size: 3, brushType: 'fountain', paths: [
                // Head outline
                [{ dx: -60, dy: -150 }, { dx: -130, dy: -80 }, { dx: -140, dy: 100 }, { dx: -40, dy: 250 }, { dx: 40, dy: 250 }, { dx: 140, dy: 100 }, { dx: 130, dy: -80 }, { dx: 60, dy: -150 }],
                // Eyes
                [{ dx: -70, dy: -20 }, { dx: -30, dy: -20 }, { dx: -30, dy: 40 }, { dx: -70, dy: 40 }, { dx: -70, dy: -20 }],
                [{ dx: 30, dy: -20 }, { dx: 70, dy: -20 }, { dx: 70, dy: 40 }, { dx: 30, dy: 40 }, { dx: 30, dy: -20 }],
                // Mouth
                [{ dx: -10, dy: 60 }, { dx: 10, dy: 60 }],
                // Shirt
                [{ dx: -120, dy: 155 }, { dx: -155, dy: 260 }, { dx: -155, dy: 395 }, { dx: 155, dy: 395 }, { dx: 155, dy: 260 }, { dx: 120, dy: 155 }],
                // Hand holding can
                [{ dx: -180, dy: 300 }, { dx: -240, dy: 300 }, { dx: -240, dy: 500 }, { dx: -180, dy: 500 }, { dx: -180, dy: 300 }]
            ]},
            // 6. SQUIDWARD DETAIL (BLUE)
            { color: '#6a8dad', size: 5, brushType: 'fountain', paths: [
                [{ dx: -40, dy: 200 }, { dx: 40, dy: 200 }, { dx: 40, dy: 350 }, { dx: -40, dy: 350 }, { dx: -40, dy: 200 }],
                [{ dx: 0, dy: 200 }, { dx: 0, dy: 350 }]
            ]}
        ]
    }
};
