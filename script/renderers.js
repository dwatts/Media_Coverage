// Media Sites Renderer

const verticalOffsetTwo = {
  screenLength: 600,
  maxWorldLength: 5000,
  minWorldLength: 1000,
};

function getSiteColorTwo(icon) {
  return {
    type: "point-3d",
    symbolLayers: [
      {
        type: "icon",
        resource: {
          href: icon,
        },
        // material: {
        //   color: "red",
        // },
        size: 22,
        outline: {
          color: "red",
          size: 2,
        },
      },
    ],

    verticalOffset: verticalOffsetTwo,

    callout: {
      type: "line",
      color: [0, 0, 0],
      size: 1.5,
      border: {
        color: [0, 0, 0],
      },
    },
  };
}

const mediaRenderer = {
  type: "unique-value",
  field: "MediaType",
  uniqueValueInfos: [
    {
      value: "Print",
      // symbol: getSiteColorTwo("assets/Newspaper.png"),
      symbol: getSiteColorTwo("assets/icons/Newspaper_Circle.png"),
    },
    {
      value: "Radio",
      // symbol: getSiteColorTwo("assets/Radio.png"),
      symbol: getSiteColorTwo("assets/icons/Radio_Circle.png"),
    },
  ],
};
