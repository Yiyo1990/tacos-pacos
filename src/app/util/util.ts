const configDropdown = {
  displayFn: (item: any) => { return item.name; }, //a replacement ofr displayKey to support flexible text displaying for each item
  displayKey: "name", //if objects array passed which key to be displayed defaults to description
  search: false, //true/false for the search functionlity defaults to false,
  height: 'auto', //height of the list so that if there are more no of items it can show a scroll defaults to auto. With auto height scroll will never appear
  placeholder: 'Select', // text to be displayed when no item is selected defaults to Select,
  customComparator: () => { return 0 }, // a custom function using which user wants to sort the items. default is undefined and Array.sort() will be used in that case,
  limitTo: 0, // number thats limits the no of options displayed in the UI (if zero, options will not be limited)
  moreText: 'more', // text to be displayed whenmore than one items are selected like Option 1 + 5 more
  noResultsFound: 'No results found!', // text to be displayed when no items are found while searching
  searchPlaceholder: 'Buscar', // label thats displayed in search input,
  searchOnKey: 'id', // key on which search should be performed this will be selective search. if undefined this will be extensive search on all keys
  clearOnSelection: true,
  inputDirection: 'ltr'
}

const firstUpperCase = (str: string) => {
  if (str === '') return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}


const groupArrayByKey = (sales: Array<any>, keyName: string): Array<any>  => {
  const grouped = sales.reduce((result, item) => {
    let key = item[keyName]
    if (!result[key]) {
      result[key] = []
    }
    result[key].push(item)
    return result
  }, {})
  return grouped
}

const barChartOptions = {
  responsive: true,
  scales: {
    x: {},
    y: {
      min: 10,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    datalabels: {
      font: {
        size: 20,
      }
    },
    tooltip: {
      callbacks: {
         title : () => '' // or function () { return null; }
      }
   }
  },
};

const donutChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
};


export { configDropdown, firstUpperCase, barChartOptions, donutChartOptions, groupArrayByKey }