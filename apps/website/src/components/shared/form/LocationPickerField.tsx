import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

// TO-DO:
// 1) Guardar localización en el post. Estaría guay mostrar un globo del mundo con la localización de la persona, pero
// si no es posible con guardar la cadena de texto de la localización creo que es suficiente. Igual se puede añadir
// la banderita al lado de la localización con <img src="https://flagsapi.com/:country_code/flat/64.png">
// La api superior tiene licencia MIT, tener en cuenta antes de subir nada.
// 2) Guardar coordenadas en lugar del geonameId por si cambiamos de API poder representarlo igualmente.
// 3) Crear mapa que represente las localizaciones. Puedo crear varios mapas, uno por país más general y otro más específico
// que represente cada usuario en su ciudad, y cuantos más usuarios más grande el círculo.
// 4) Tener en cuenta que un usuario puede crear varios posts en la misma localización, no contar a ese usuario varias veces.
// 5) En el menu de admin dar la posibilidad de eliminar la localización, por si es una localización polémica o doxxes someone.

/**
 * Location returned by the API. This is the more relevant API agnostic data.
 */
type FilteredLocation = {
  geonameId: number;
  name: string;
  adminName: string; // Administrative subdivision: US State, Spanish Autonomous Community, etc.
  countryName: string;
  lattitude: string;
  longitude: string;
};

/**
 * For featureClasses and featureCodes @see {@link https://www.geonames.org/export/codes.html|Feature types}
 */
export type LocationPickerFieldProps = {
  label: string;
  placeholder: string;
  maxLength: number;
  queryType: "name_startsWith"; // Implement the rest when needed.
  featureClasses?: string[];
  featureCodes?: string[];
};

/**
 * Minimun length to not spam the API. Tips if you are on the list below:
 * If you live in a two letter place just add a comma.
 * If you live in a one letter place add a comma and space.
 * @see {@link https://en.wikipedia.org/wiki/List_of_short_place_names|List of short place names}
 */
const MINIMUM_SEARCH_LENGTH = 3;
const DEBOUNCE_DELAY_MS = 300;

const API_URL = "http://api.geonames.org/search?";
const API_USER = "xilipa3578"; // FIXME: idk where to put this, but surely not here.

export function LocationPickerField(props: LocationPickerFieldProps) {
  const [filteredLocations, setFilteredLocations] = useState(
    [] as FilteredLocation[],
  );
  const [tooltip, setTooltip] = useState("");
  const [inputValue, setInputValue] = useState("");

  /**
   * Clears the dropwdown so it stops appearing, better than just hiding it with all the info still loaded.
   */
  const clearFilteredLocationDropdown = (): void => {
    setFilteredLocations([] as FilteredLocation[]);
  };

  /**
   * Creates a feature parameter string ready to pass to the api url
   * @param features array of features. See documentation
   * @param featureType featureClass is the group, featureCode is each individual category.
   * @see {@link https://www.geonames.org/export/codes.html|Classes and Codes List}
   * @returns String containing all the features to filter the api call
   */
  const processFeatures = (
    features?: string[],
    featureType?: "featureClass" | "featureCode",
  ) => {
    if (!features) return "";

    let fString = "";
    features.forEach((f: string) => {
      fString += `&${featureType}=${f}`;
    });
    return fString;
  };

  /**
   * Sends a request to the API with the query type, features and query term passed.
   * @param query User input value
   * @see {@link https://www.geonames.org/export/geonames-search.html|Endpoint Documentation}
   */
  const searchLocation = async (query: string) => {
    try {
      const featureClasses = processFeatures(
        props.featureClasses,
        "featureClass",
      );
      const featureCodes = processFeatures(props.featureCodes, "featureCode");
      const urlParams = `${props.queryType}=${query}${featureClasses}${featureCodes}&type=json&username=${API_USER}`;

      const res = await fetch(`${API_URL}${urlParams}`);
      const data = await res.json();

      const tempLocations = [] as FilteredLocation[];

      data["geonames"]?.forEach(
        (element: {
          geonameId: number;
          name: string;
          adminName1: string;
          countryName: string;
          lat: string;
          lng: string;
        }) => {
          // API returns multiple equally named locations in the same area, the only difference being coordinates.
          // We'll assume that two locations are equal if their city/village name, administrative name and country name are the same.
          const exists = tempLocations.find(
            (l) =>
              l.name === element.name &&
              l.adminName === element.adminName1 &&
              l.countryName === element.countryName,
          );

          if (!exists) {
            const loc: FilteredLocation = {
              geonameId: element.geonameId,
              name: element.name,
              adminName: element.adminName1,
              countryName: element.countryName,
              lattitude: element.lat,
              longitude: element.lng,
            };
            tempLocations.push(loc);
          }
        },
      );

      if (tempLocations.length > 0) {
        setTooltip("");
        setFilteredLocations(tempLocations);
      } else {
        clearFilteredLocationDropdown();
        setTooltip("Location not found. Try with a nearby village or city.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Handles the input, search and tooltips.
   * Throttles calls to the API to not use all the credits, in case a user has a bad day and misses all their keystrokes.
   */
  const handleSearch = useDebouncedCallback(({ value }) => {
    if (value) {
      value = value.trim().replace(/\s{2,}/g, ""); // "Sanitize" the string.
      if (value.length >= MINIMUM_SEARCH_LENGTH) {
        searchLocation(value);
      } else {
        setTooltip(
          `Write at least ${MINIMUM_SEARCH_LENGTH} characters to start searching.`,
        );
        clearFilteredLocationDropdown();
      }
    } else {
      setTooltip("");
      clearFilteredLocationDropdown();
    }
  }, DEBOUNCE_DELAY_MS);

  // TODO: handle loss of focus
  const handleFocusLoss = () => {
    console.log(`LOST FOCUS WITH INPUT VALUE ${inputValue}`);
  };

  return (
    <div>
      <label>{props.label}</label>
      <input
        type="text"
        value={inputValue}
        className="w-full rounded-sm border border-gray-700 bg-white p-1 text-black"
        onChange={(e) => setInputValue(e.target.value)}
        onInput={(e) => handleSearch(e.target)}
        placeholder={props.placeholder}
        maxLength={props.maxLength}
      ></input>
      {filteredLocations.length > 0 && (
        <div className="max-h-40 w-full overflow-y-auto rounded-sm border border-gray-700 bg-white p-1 text-black">
          {filteredLocations.map((location) => (
            <div
              key={location.geonameId}
              onClick={() => {
                setInputValue(
                  `${location.name}, ${location.adminName} (${location.countryName})`,
                );
                clearFilteredLocationDropdown();
              }}
            >
              {`${location.name}, ${location.adminName} (${location.countryName})`}
            </div>
          ))}
        </div>
      )}
      {tooltip && (
        <div className="max-h-40 w-full overflow-y-auto rounded-sm border border-gray-700 bg-white p-1 text-gray-500">
          {tooltip}
        </div>
      )}
    </div>
  );
}
