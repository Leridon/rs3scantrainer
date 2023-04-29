import * as React from "react";
import { useState, useMemo, useEffect, useCallback } from "react";
import classnames from "classnames";
import { boundMethod } from "autobind-decorator";
import { Marker3d, WorldMap, MapMode } from "./map";
import { showSettings } from "./data";

require("./style.scss");


export function MapControls(p: { map: WorldMap }) {
	//todo figure out redux for this stuff
	let [mapmode, setMapMode] = useState(p.map.mode);
	let [floor, setFloor] = useState(p.map.floor);
	let [menuopen, setmenuopen] = useState(false);
	let [hideteleports, setHideTeleports] = useState(p.map.settings.hideTeleports);

	useEffect(() => {
		p.map.on("floor", setFloor);
		p.map.on("mode", setMapMode);
		p.map.on("hideteleports", setHideTeleports);
		return () => {
			p.map.off("floor", setFloor);
			p.map.off("mode", setMapMode);
			p.map.off("hideteleports", setHideTeleports);
		};
	}, [p.map]);

	let floors: Record<number, any> = { 0: null, 1: null, 2: null, 3: null };

	return (
		<div className="map-layermenucontainer" onMouseEnter={() => setmenuopen(true)} onMouseLeave={() => setmenuopen(false)}>
			<div className="map-layermenu">
				{mapmode == "map" || mapmode == "flatwalled" || mapmode == "collision" ? (
					<div className="map-layermenu__outer">
						<div className="map-layermenu__tooltip">satellite</div>
						<div onClick={e => p.map.setBaseLayer("3d", floor)} className="map-layermenu__layer map-layermenu__layer--selected" style={{ backgroundImage: `url('${require("./imgs/3d.png")}')` }} />
					</div>
				) : (
					<div className="map-layermenu__outer">
						<div className="map-layermenu__tooltip">map</div>
						<div onClick={e => p.map.setBaseLayer("flatwalled", floor)} className="map-layermenu__layer map-layermenu__layer--selected" style={{ backgroundImage: `url('${require("./imgs/flat.png")}')` }} />
					</div>
				)}
			</div>
			{menuopen &&
				<React.Fragment>
					<div className="map-layermenu__spacer" />
					<div className="map-layermenu">
						{mapmode == "3d" && (
							<div className="map-layermenu__outer">
								<div className="map-layermenu__tooltip">flat</div>
								<div onClick={e => p.map.setBaseLayer("flat", floor)} className={classnames("map-layermenu__layer")} style={{ backgroundImage: `url('${require("./imgs/noperspective.png")}')` }} />
							</div>
						)}
						{mapmode == "flat" && (
							<div className="map-layermenu__outer">
								<div className="map-layermenu__tooltip">3D</div>
								<div onClick={e => p.map.setBaseLayer("3d", floor)} className={classnames("map-layermenu__layer")} style={{ backgroundImage: `url('${require("./imgs/perspective.png")}')` }} />
							</div>
						)}

						{(mapmode == "map" || mapmode == "collision") && (
							<div className="map-layermenu__outer">
								<div className="map-layermenu__tooltip">default</div>
								<div onClick={e => p.map.setBaseLayer("flatwalled", floor)} className={classnames("map-layermenu__layer")} style={{ backgroundImage: `url('${require("./imgs/flat.png")}')` }} />
							</div>
						)}
						{(mapmode == "map" || mapmode == "flatwalled") && (
							<div className="map-layermenu__outer">
								<div className="map-layermenu__tooltip">walls</div>
								<div onClick={e => p.map.setBaseLayer("collision", floor)} className={classnames("map-layermenu__layer")} style={{ backgroundImage: `url('${require("./imgs/collision.png")}')` }} />
							</div>
						)}
						{(mapmode == "flatwalled" || mapmode == "collision") && (
							<div className="map-layermenu__outer">
								<div className="map-layermenu__tooltip">classic</div>
								<div onClick={e => p.map.setBaseLayer("map", floor)} className={classnames("map-layermenu__layer")} style={{ backgroundImage: `url('${require("./imgs/map.png")}')` }} />
							</div>
						)}
					</div>
					<div className="map-layermenu__spacer" />
					<div className="map-layermenu">
						<div className="map-layermenu__outer">
							<div className="map-layermenu__tooltip">teleports</div>
							<div onClick={e => p.map.toggleTeleports(!!hideteleports)} className={classnames("map-layermenu__layer", { "map-layermenu__layer--selected": !hideteleports })} style={{ backgroundImage: `url('${require("./imgs/teleports.png")}')` }} />
						</div>
						<div className="map-layermenu__outer">
							<div className="map-layermenu__tooltip">floor</div>
							<div className="map-layermenu__floor" >
								<div className="map-layermenu__floor__number">{p.map.floor}</div>
								<div className="map-layermenu__floor__plus" onClick={e => p.map.setBaseLayer(mapmode, Math.min(3, p.map.floor + 1))}>+</div>
								<div className="map-layermenu__floor__minus" onClick={e => p.map.setBaseLayer(mapmode, Math.max(0, p.map.floor - 1))}>-</div>
							</div>
						</div>
						<div className="map-layermenu__outer">
							<div className="map-layermenu__tooltip">settings</div>
							<div onClick={e => showSettings(p.map.settings, document.body, p.map.onTeleportsChanged)} className={classnames("map-layermenu__layer")} style={{ backgroundImage: `url('${require("./imgs/settings.png")}')` }} />
						</div>
					</div>
				</React.Fragment>
			}
		</div >
	);
}