import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

type LocationResult = {
  geonameId: number;
  name: string;
  adminName: string;
  countryName: string;
};

// TO-DO:
// 1) Guardar localización en el post. Estaría guay mostrar un globo del mundo con la localización de la persona, pero
// si no es posible con guardar la cadena de texto de la localización creo que es suficiente. Igual se puede añadir
// la banderita al lado de la localización con <img src="https://flagsapi.com/:country_code/flat/64.png">
// La api superior tiene licencia MIT, tener en cuenta antes de subir nada.
// 2) Guardar coordenadas en lugar del geonameId por si cambiamos de API poder representarlo igualmente.
// 3) Crear mapa que represente las localizaciones. Puedo crear varios mapas, uno por país más general y otro más específico
// que represente cada usuario en su ciudad, y cuantos más usuarios más grande el círculo.
// 4) Tener en cuenta que un usuario puede crear varios posts en la misma localización, no contar a ese usuario varias veces.

const MINIMUM_SEARCH_LENGTH = 3; // Arbitrary minimun length to not spam the API. Any 3 letter locations? :thinking-emoji:
const API_USER = "xilipa3578"; // FIXME: idk where to put this, but surely not here.

export function LocationPickerField() {
  const [filteredLocations, setFilteredLocations] = useState(
    [] as LocationResult[],
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const searchLocation = async (q: string) => {
    const res = await fetch(
      `http://api.geonames.org/search?name_startsWith=${q}&type=json&featureClass=p&username=${API_USER}`,
    );
    const data = await res.json();

    const tempLocations = [] as LocationResult[];

    data["geonames"].forEach(
      (element: {
        geonameId: number;
        name: string;
        adminName1: string;
        countryName: string;
      }) => {
        const loc: LocationResult = {
          geonameId: element.geonameId,
          name: element.name,
          adminName: element.adminName1,
          countryName: element.countryName,
        };
        tempLocations.push(loc);
      },
    );

    setFilteredLocations(tempLocations);
  };

  const handleSearch = useDebouncedCallback(({ value }) => {
    if (value && value.length > MINIMUM_SEARCH_LENGTH) {
      setShowDropdown(true);
      searchLocation(value);
    } else {
      setShowDropdown(false);
      setFilteredLocations([]);
    }
  }, 500);

  return (
    <div>
      <label>Location</label>
      <input
        type="text"
        value={inputValue}
        className="w-full rounded-sm border border-gray-700 bg-white p-1 text-black"
        onChange={(e) => setInputValue(e.target.value)}
        onInput={(e) => handleSearch(e.target)}
        placeholder="Would you like to disclose your aproximate location?"
      ></input>
      {showDropdown && (
        <div className="max-h-40 w-full overflow-y-auto rounded-sm border border-gray-700 bg-white p-1 text-black">
          {filteredLocations.map((location) => (
            <div
              key={location.geonameId}
              onClick={() => {
                setInputValue(
                  `${location.name}, ${location.adminName} (${location.countryName})`,
                );
                setShowDropdown(false);
                console.log(location.geonameId);
              }}
            >
              {`${location.name}, ${location.adminName} (${location.countryName})`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
