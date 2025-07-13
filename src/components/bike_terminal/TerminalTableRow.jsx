import React from "react";
import { Typography } from "@material-tailwind/react";
import {
  FaChevronCircleRight,
  FaChevronCircleDown,
  FaPenSquare,
  FaMapMarkerAlt,
  FaBuilding,
  FaCircle,
  FaEye,
  FaEdit,
} from "react-icons/fa";

const BUTTON_STYLES = {
  primary:
    "bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1 shadow-sm hover:shadow-md",
  secondary:
    "bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1",
  expand: "p-2 rounded-full hover:bg-blue-50 transition-all duration-200 group",
};

const TerminalTableRow = ({
  terminal,
  index,
  isExpanded,
  onEdit,
  onShow,
  onToggleExpand,
}) => {
  const handleEdit = () => {
    onEdit(terminal);
  };

  const handleShow = () => {
    onShow(terminal);
  };

  // Determine status
  const isActive = !terminal.deleted_at;
  const hasGeofencing = terminal.radius && terminal.radius > 0;

  return (
    <>
      <tr className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 group">
        <td className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              {index + 1}
            </div>
          </div>
        </td>

        <td className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl">
              <FaBuilding className="text-gray-600 text-lg" />
            </div>
            <div>
              <Typography
                variant="h6"
                className="text-gray-800 font-semibold mb-1"
              >
                {terminal.name || "Unnamed Terminal"}
              </Typography>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  {terminal.code || "N/A"}
                </span>
                {hasGeofencing && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                    {terminal.radius}m radius
                  </span>
                )}
              </div>
            </div>
          </div>
        </td>

        <td className="p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-gray-400 text-sm" />
              <Typography variant="small" className="text-gray-600">
                {terminal.latitude?.toFixed(6)},{" "}
                {terminal.longitude?.toFixed(6)}
              </Typography>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <FaCircle
                  className={`text-xs ${
                    isActive ? "text-green-500" : "text-red-500"
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    isActive ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {terminal.created_at && (
                <span className="text-xs text-gray-500">
                  Added {new Date(terminal.created_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </td>

        <td className="p-6">
          <div className="flex items-center gap-3">
            <button
              className={BUTTON_STYLES.primary}
              type="button"
              onClick={handleEdit}
              aria-label={`Edit terminal ${terminal.name || index + 1}`}
              title="Edit terminal"
            >
              <FaEdit size={12} />
              <span>Edit</span>
            </button>

            <button
              className={BUTTON_STYLES.secondary}
              type="button"
              onClick={handleShow}
              aria-label={`View terminal ${terminal.name || index + 1} details`}
              title="View details"
            >
              <FaEye size={12} />
              <span>View</span>
            </button>

            <button
              onClick={onToggleExpand}
              className={BUTTON_STYLES.expand}
              aria-label={isExpanded ? "Collapse details" : "Expand details"}
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <FaChevronCircleDown
                  className="text-blue-500 group-hover:text-blue-600 transition-colors duration-200"
                  size={20}
                />
              ) : (
                <FaChevronCircleRight
                  className="text-blue-500 group-hover:text-blue-600 transition-colors duration-200"
                  size={20}
                />
              )}
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded Details Row */}
      {isExpanded && (
        <tr className="bg-gradient-to-r from-blue-50/30 to-transparent">
          <td colSpan={4} className="p-6 pt-0">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Basic Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FaBuilding className="text-blue-500" />
                    Basic Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-medium">
                        {terminal.id || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Code:</span>
                      <span className="font-medium">
                        {terminal.code || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">
                        {terminal.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Admin ID:</span>
                      <span className="font-medium">
                        {terminal.admin_id || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-green-500" />
                    Location Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Latitude:</span>
                      <span className="font-medium">
                        {terminal.latitude?.toFixed(8) || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Longitude:</span>
                      <span className="font-medium">
                        {terminal.longitude?.toFixed(8) || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Radius:</span>
                      <span className="font-medium">
                        {terminal.radius ? `${terminal.radius}m` : "N/A"}
                      </span>
                    </div>
                    {terminal.center_point_geojson && (
                      <div className="mt-2">
                        <span className="text-gray-600 text-xs">
                          Has GeoJSON data
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Timestamps */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FaCircle
                      className={isActive ? "text-green-500" : "text-red-500"}
                    />
                    Status & Timeline
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`font-medium ${
                          isActive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">
                        {terminal.created_at
                          ? new Date(terminal.created_at).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Updated:</span>
                      <span className="font-medium">
                        {terminal.updated_at
                          ? new Date(terminal.updated_at).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    {terminal.deleted_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Deleted:</span>
                        <span className="font-medium text-red-600">
                          {new Date(terminal.deleted_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Geofencing Information */}
              {terminal.geofencing_area && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-purple-500 rounded-full"></div>
                    Geofencing Area
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">
                      This terminal has a defined geofencing area for
                      location-based services.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Coordinate System: EPSG:3857</span>
                      <span>Area Type: Polygon</span>
                      {terminal.radius && (
                        <span>Radius: {terminal.radius}m</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default React.memo(TerminalTableRow);
