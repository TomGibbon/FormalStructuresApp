import numpy as np
import matplotlib.pyplot as plt

values = [
  814.000000,
  603.000000,
  8968.000000,
  845.000000,
  808.000000,
  776.000000,
  853.000000,
  732.000000,
  886.000000,
  756.000000,
  688.000000,
  734.000000,
  3822.000000,
  3333.000000,
  688.000000,
  18215.000000,
  1417.000000,
  16347.000000,
  8321.000000,
  10280.000000,
  2946.000000,
  1925.000000,
  679.000000,
  1631.000000,
  822.000000,
  659.000000,
  951.000000,
  564.000000,
  1090.000000,
  1068.000000,
  652.000000,
  8970.000000,
  11658.000000
]

values = [x / 1000 for x in values]
n = range(1, len(values) + 1)
mean_value = np.mean(values)
plt.axhline(y=mean_value, color='blue', linestyle='--', label='Mean')
print(mean_value)
median_value = np.percentile(sorted(values), 50)
plt.axhline(y=median_value, color='purple', linestyle='--', label='Median')
print(median_value)
# plt.axhline(y=2, color='green', linestyle='--', label='2')
plt.axhline(y=5, color='green', linestyle='--', label='5 seconds')

plt.scatter(n, values, marker='x', color='red')

plt.legend()

plt.xticks(n, n)
plt.xlabel('Test number')
plt.ylabel('Time taken for test (seconds)')
plt.title('Testing times')

# Show the graph
plt.show()