import cv2
import numpy as np
import matplotlib.pyplot as plt

# Load the image
image = cv2.imread('otsu-image.jpg')

# Flatten the image array to a 1D array
pixel_values = image.flatten()

# Plot histogram
plt.hist(pixel_values, bins=256, range=(0, 256), density=True, color='r')#, alpha=0.7)
plt.axvline(x=138, color='blue', linestyle='--', label='Threshold t')
plt.legend()
plt.xlabel('Pixel Value')
plt.ylabel('Frequency')
plt.title('Histogram of Pixel Values')
plt.show()