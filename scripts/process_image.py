import cv2
import numpy as np
import json
import sys
import os

def process_image(image_path, output_path=None, max_width=1000):
    if not os.path.exists(image_path):
        print(f"Error: Image not found at {image_path}")
        return

    # 1. Load Image
    img = cv2.imread(image_path)
    if img is None:
        print("Error: Could not load image.")
        return

    # 2. Resize maintaining aspect ratio
    h, w = img.shape[:2]
    scale = max_width / float(w)
    new_h = int(h * scale)
    img = cv2.resize(img, (max_width, new_h))
    
    # 3. Edge Detection
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Less blur to keep sharp pixel details
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)
    # Canny parameters tuned for sketch
    edges = cv2.Canny(blurred, 30, 100)

    # 4. Find Contours
    contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

    # 5. Simplify paths (PolyDP)
    simplified_contours = []
    min_length = 15 # Slightly more sensitive
    
    for cnt in contours:
        length = cv2.arcLength(cnt, True)
        if length < min_length:
            continue
            
        # Lower epsilon for higher precision (closer to original pixels)
        epsilon = 0.001 * length 
        approx = cv2.approxPolyDP(cnt, epsilon, False) 
        
        if len(approx) > 2: 
            simplified_contours.append(approx)

    # 6. Sort Paths (Nearest Neighbor TSP)
    if not simplified_contours:
        print("No contours found.")
        return

    sorted_contours = []
    center_x = max_width / 2
    center_y = new_h / 2
    current_pos = np.array([center_x, center_y])
    
    pool = simplified_contours[:]
    
    while pool:
        best_idx = 0
        min_dist = float('inf')
        reverse_best = False
        
        # Optimization: Scan limited window for speed
        scan_limit = 500
        for i in range(min(len(pool), scan_limit)):
            cnt = pool[i]
            # Use the first point of the contour
            start_pt = cnt[0][0]
            dist_start = np.linalg.norm(start_pt - current_pos)
            end_pt = cnt[-1][0]
            dist_end = np.linalg.norm(end_pt - current_pos)
            
            if dist_start < min_dist:
                min_dist = dist_start
                best_idx = i
                reverse_best = False
            
            if dist_end < min_dist:
                min_dist = dist_end
                best_idx = i
                reverse_best = True
                
        best_cnt = pool.pop(best_idx)
        if reverse_best:
            best_cnt = best_cnt[::-1]
            
        sorted_contours.append(best_cnt)
        current_pos = best_cnt[-1][0]

    # 7. Convert to JSON format for DrawingSystem
    # Output single stroke group with white color
    
    json_paths = []
    
    for cnt in sorted_contours:
        path_points = []
        for point in cnt:
            x, y = point[0]
            path_points.append({
                "dx": int(x - center_x),
                "dy": int(y - center_y)
            })
        json_paths.append(path_points)

    output_data = {
        "name": "Generated Sketch",
        "scale": 1.0,
        "isStacked": False, 
        "wordSpacingY": 0,
        "strokes": [
            {
                "color": "#ffffff", 
                "brushType": "standard", 
                "size": 2, 
                "static": True, # Enable Path2D Caching
                "paths": json_paths
            }
        ]
    }

    if output_path:
        with open(output_path, 'w') as f:
            json.dump(output_data, f)
        print(f"Saved to {output_path}")
    else:
        print(json.dumps(output_data))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python process_image.py <input_image_path> [output_json_path]")
    else:
        in_path = sys.argv[1]
        out_path = sys.argv[2] if len(sys.argv) > 2 else "output.json"
        process_image(in_path, out_path)
