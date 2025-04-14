await ymaps3.ready;

export const {
  YMap,
  YMapDefaultSchemeLayer,
  YMapDefaultFeaturesLayer,
  YMapControls,
  YMapListener,
  YMapMarker,
} = ymaps3;

export const { YMapGeolocationControl, YMapZoomControl } = await import(
  '@yandex/ymaps3-default-ui-theme'
);
