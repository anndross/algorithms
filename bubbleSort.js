const bubbleSort = (array) => {
  for (let i = 0; i < array.length; i++) {
    for (let j = i + 1; j < array.length; j++) {
      if (array[i] > array[j]) {
        let tempItem = array[i];
        array[i] = array[j];
        array[j] = tempItem;
      }
    }
  }
  return array;
};
