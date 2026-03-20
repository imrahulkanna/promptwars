import React, { useEffect, useState, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { MapPin, Navigation, AlertCircle, Clock, Star, PhoneCall } from "lucide-react";

interface HospitalData {
    placeId: string;
    name: string;
    distanceMi: number;
    isOpen: boolean;
    statusText: string;
    rating: number;
    userRatingsTotal: number;
}

interface DynamicHospitalBridgeProps {
    severity: number;
}

const calculateDistanceMiles = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3958.8;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const DynamicHospitalBridge: React.FC<DynamicHospitalBridgeProps> = ({ severity }) => {
    const [hospitals, setHospitals] = useState<HospitalData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isMounted = true;

        const findHospitals = async () => {
            try {
                if (!navigator.geolocation) {
                    throw new Error("Geolocation is not supported by your browser.");
                }

                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0,
                    });
                });

                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
                if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
                    throw new Error("Missing Google Maps API Key.");
                }

                setOptions({
                    key: apiKey,
                    v: "weekly",
                });

                await importLibrary("places");

                if (!isMounted) return;

                const mapNode = mapRef.current || document.createElement("div");
                const service = new google.maps.places.PlacesService(mapNode);

                const request: google.maps.places.PlaceSearchRequest = {
                    location: new google.maps.LatLng(userLat, userLng),
                    rankBy: google.maps.places.RankBy.DISTANCE,
                    type: "hospital",
                    keyword: 'hospital',
                };

                service.nearbySearch(request, (results, status) => {
                    if (!isMounted) return;

                    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                        const parsedHospitals: HospitalData[] = results.slice(0, 5).map((place) => {
                            const placeLat = place.geometry?.location?.lat() || 0;
                            const placeLng = place.geometry?.location?.lng() || 0;
                            const distance = calculateDistanceMiles(
                                userLat,
                                userLng,
                                placeLat,
                                placeLng,
                            );

                            return {
                                placeId: place.place_id || "",
                                name: place.name || "Unknown Medical Center",
                                distanceMi: distance,
                                isOpen: place.opening_hours?.isOpen() || false,
                                statusText: place.business_status || "OPERATIONAL",
                                rating: place.rating || 0,
                                userRatingsTotal: place.user_ratings_total || 0,
                            };
                        });

                        parsedHospitals.sort((a, b) => a.distanceMi - b.distanceMi);

                        setHospitals(parsedHospitals);
                        setLoading(false);
                    } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                        setError("No trauma centers or hospitals found nearby.");
                        setLoading(false);
                    } else {
                        setError(`Places API failed: ${status}`);
                        setLoading(false);
                    }
                });
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message || "Failed to locate nearby medical facilities.");
                    setLoading(false);
                }
            }
        };

        findHospitals();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="mt-8 border-t border-gray-800 pt-8 relative">
            <div ref={mapRef} style={{ display: "none" }} />

            <div className="flex items-center space-x-3 mb-6">
                <MapPin className="text-hospital-blue w-6 h-6" />
                <h3 className="text-2xl font-bold text-white uppercase tracking-wider">
                    Near by Support
                </h3>
            </div>

            {loading ? (
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-emergency-yellow mb-4 animate-pulse">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-mono tracking-widest text-sm uppercase">
                            Scanning for nearest trauma centers...
                        </span>
                    </div>
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="bg-emergency-gray border border-gray-800 rounded-2xl p-6 flex justify-between items-center opacity-60 animate-pulse"
                        >
                            <div className="space-y-3 w-1/2">
                                <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                            </div>
                            <div className="flex space-x-3">
                                <div className="h-12 w-32 bg-gray-800 rounded-xl"></div>
                                <div className="h-12 w-32 bg-gray-700 rounded-xl"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="bg-red-950/20 border border-emergency-red/50 text-emergency-red p-6 rounded-2xl font-mono text-sm flex items-center shadow-[0_0_15px_rgba(255,59,48,0.1)]">
                    <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {hospitals.map((hospital, idx) => {
                        const isClosestAndCritical = idx === 0 && severity > 7;

                        return (
                            <div
                                key={hospital.placeId}
                                className={`bg-emergency-black border p-5 sm:p-6 rounded-2xl transition-all relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isClosestAndCritical ? "border-emergency-red shadow-[0_0_20px_rgba(255,59,48,0.2)]" : "border-gray-800 hover:border-gray-600"}`}
                            >
                                <div
                                    className={`absolute left-0 top-0 w-1 h-full ${isClosestAndCritical ? "bg-emergency-red shadow-[0_0_15px_rgba(255,59,48,1)]" : "bg-hospital-blue"}`}
                                ></div>

                                <div className="space-y-2 flex-grow pl-2">
                                    <div className="flex items-center space-x-3">
                                        <h4
                                            className="text-xl font-bold text-white uppercase tracking-wide truncate max-w-[280px] sm:max-w-md"
                                            title={hospital.name}
                                        >
                                            {hospital.name}
                                        </h4>
                                        {isClosestAndCritical && (
                                            <span className="bg-emergency-red text-white text-xs font-black uppercase px-2 py-1 rounded animate-pulse tracking-widest flex-shrink-0">
                                                CRITICAL MATCH
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-gray-400">
                                        <span className="flex items-center">
                                            <Navigation className="w-4 h-4 mr-1 text-gray-500" />
                                            {hospital.distanceMi.toFixed(1)} MILES
                                        </span>
                                        <span
                                            className={`flex items-center ${hospital.isOpen ? "text-terminal-green" : "text-gray-500"}`}
                                        >
                                            <Clock className="w-4 h-4 mr-1" />
                                            {hospital.isOpen ? "OPEN NOW" : hospital.statusText}
                                        </span>
                                        {hospital.rating > 0 && (
                                            <span className="flex items-center text-emergency-yellow">
                                                <Star className="w-4 h-4 mr-1 fill-current" />
                                                {hospital.rating} ({hospital.userRatingsTotal})
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex space-x-3 mt-4 sm:mt-0">
                                    <a
                                        href="tel:911"
                                        className="flex items-center justify-center px-4 py-3 sm:px-6 sm:py-4 bg-gray-900 hover:bg-emergency-gray border border-gray-700 hover:border-emergency-red rounded-xl text-white font-bold transition-all"
                                    >
                                        <PhoneCall className="w-5 h-5 sm:mr-2 text-emergency-red" />
                                        <span className="hidden sm:inline">CALL 911</span>
                                    </a>

                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospital.name)}&destination_place_id=${hospital.placeId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center justify-center px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:brightness-110 ${isClosestAndCritical ? "bg-emergency-red text-white" : "bg-hospital-blue text-white"}`}
                                    >
                                        <Navigation className="w-5 h-5 mr-2" />
                                        ROUTE NOW
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
