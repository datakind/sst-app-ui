import React, { useState } from 'react';
import { useControl, Marker } from 'react-map-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

export default function GeocoderControl(props) {
    const [marker, setMarker] = useState(null);

    const geocoder = useControl(
        () => {
            const ctrl = new MapboxGeocoder({
                ...props,
                marker: false,
                accessToken: props.mapboxAccessToken
            });
            ctrl.on('loading', props.onLoading);
            ctrl.on('results', () => {
                const input = ctrl.inputString;
                if (isCensusTract(input)) {
                    console.log('is tract!', input);
                    props.setSearchedFips(input);
                    const inputElement = document.querySelector('.mapboxgl-ctrl-geocoder--input');
                    if (inputElement) {
                        inputElement.blur();
                    }
                } else {
                    props.setSearchedFips(null);
                }
            });
            ctrl.on('result', evt => {
                props.onResult(evt);
                const { result } = evt;
                const location = result && (result.center || (result.geometry?.type === 'Point' && result.geometry.coordinates));

                if (location && props.marker) {
                    setMarker(<Marker {...props.marker} longitude={location[0]} latitude={location[1]} />);
                } else {
                    setMarker(null);
                }
            });

            ctrl.on('error', props.onError);
            return ctrl;
        },
        {
            position: props.position
        }
    );

    if (geocoder._container) {
        geocoder._container.style.position = 'absolute';
        geocoder._container.style.top = '10px';
        geocoder._container.style.left = '10px';
        geocoder._container.style.zIndex = '100';
    }

    return marker;
}

const noop = () => {};

const isCensusTract = (input) => {
    return /^\d{11}$/.test(input);
};

GeocoderControl.defaultProps = {
    marker: true,
    onLoading: noop,
    onResults: noop,
    onResult: noop,
    onError: noop
};
