import React from "react";
import { Typography } from "@material-tailwind/react";
import {
  FaChevronCircleRight,
  FaChevronCircleDown,
  FaPenSquare,
  FaMapMarkerAlt,
} from "react-icons/fa";

const BUTTON_STYLES = {
  action:
    "border-solid border-2 border-sky-500 text-sky-500 text-sm py-1 my-2 rounded-md hover:bg-sky-500 hover:text-white focus:outline-none focus:bg-white transition-colors duration-200 w-[70px]",
  edit: "mr-2",
  show: "ml-2",
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

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="p-4 border-b border-gray-200">
        <Typography variant="small" color="blue-gray" className="font-normal">
          {index + 1}
        </Typography>
      </td>

      <td className="p-4 border-b border-gray-200">
        <Typography variant="small" color="blue-gray" className="font-normal">
          {terminal.name || terminal.location || "N/A"}
        </Typography>
      </td>

      <td className="p-4 border-b border-gray-200">
        <div className="flex flex-row justify-center gap-2">
          <button
            className={`${BUTTON_STYLES.action} ${BUTTON_STYLES.edit}`}
            type="button"
            onClick={handleEdit}
            aria-label={`Edit terminal ${terminal.name || index + 1}`}
            title="Edit terminal"
          >
            <div className="flex flex-row items-center gap-1 justify-center">
              <FaPenSquare size={12} aria-hidden="true" />
              <span className="text-xs">Edit</span>
            </div>
          </button>

          {/* <button
            className={`${BUTTON_STYLES.action} ${BUTTON_STYLES.show}`}
            type="button"
            onClick={handleShow}
            aria-label={`Show terminal ${terminal.name || index + 1} on map`}
            title="Show on map"
          >
            <div className="flex flex-row items-center gap-1 justify-center">
              <FaMapMarkerAlt size={12} aria-hidden="true" />
              <span className="text-xs">Show</span>
            </div>
          </button> */}
        </div>
      </td>

      <td className="p-4 border-b border-gray-200">
        <div className="flex justify-center">
          <button
            onClick={onToggleExpand}
            className="cursor-pointer p-1 rounded-full hover:bg-gray-200 transition-colors duration-150"
            aria-label={isExpanded ? "Collapse details" : "Expand details"}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <FaChevronCircleDown
                color="#597AAF"
                size={18}
                aria-hidden="true"
              />
            ) : (
              <FaChevronCircleRight
                color="#597AAF"
                size={18}
                aria-hidden="true"
              />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default React.memo(TerminalTableRow);
