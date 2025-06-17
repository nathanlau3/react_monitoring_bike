import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "../sidebar";
import BikeTerminalModal from "./modalBikeTerminal";
import TerminalTableRow from "./TerminalTableRow";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";

import { Card, Typography } from "@material-tailwind/react";
import { FaPlus } from "react-icons/fa";
import { fetchTerminals } from "../../redux/features/mapsThunks";
import { openModal, closeModal } from "../../redux/features/mapsSlice";

// Constants
const TABLE_HEAD = ["No", "Location (Faculty)", "Action", ""];

const BUTTON_STYLES = {
  primary:
    "border-solid border-2 border-sky-500 text-sky-500 text-sm px-2 py-1 my-2 rounded-md hover:bg-sky-500 hover:text-white focus:outline-none focus:bg-white transition-colors duration-200",
  addButton: "w-auto h-[40px]",
};

const BikeTerminal = () => {
  // Redux state
  const dispatch = useDispatch();
  const { terminals, loading, error, modal } = useSelector(
    (state) => state.maps
  );

  // Local state
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Fetch terminals on component mount
  useEffect(() => {
    if (!terminals?.length) {
      dispatch(fetchTerminals());
    }
  }, [dispatch, terminals?.length]);

  // Modal handlers
  const handleOpenModal = useCallback(
    (isCreate = false, data = null) => {
      dispatch(openModal({ isCreate, data }));
    },
    [dispatch]
  );

  const handleCloseModal = useCallback(() => {
    dispatch(closeModal());
  }, [dispatch]);

  // Row expansion handler
  const handleToggleExpand = useCallback((terminalId) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(terminalId)) {
        newSet.delete(terminalId);
      } else {
        newSet.add(terminalId);
      }
      return newSet;
    });
  }, []);

  // Memoized terminal rows
  const terminalRows = useMemo(() => {
    if (!terminals?.length) return [];

    return terminals.map((terminal, index) => (
      <TerminalTableRow
        key={terminal.id || terminal.name_terminal || index}
        terminal={terminal}
        index={index}
        isExpanded={expandedRows.has(terminal.id || terminal.name_terminal)}
        onEdit={(data) => handleOpenModal(false, data)}
        onShow={(data) => handleOpenModal(false, data)}
        onToggleExpand={() =>
          handleToggleExpand(terminal.id || terminal.name_terminal)
        }
      />
    ));
  }, [terminals, expandedRows, handleOpenModal, handleToggleExpand]);

  // Loading state
  if (loading) {
    return (
      <Sidebar>
        <div className="container p-5">
          <LoadingSpinner message="Loading bike terminals..." />
        </div>
      </Sidebar>
    );
  }

  // Error state
  if (error) {
    return (
      <Sidebar>
        <div className="container p-5">
          <ErrorMessage
            message="Failed to load bike terminals"
            onRetry={() => dispatch(fetchTerminals())}
          />
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="container p-5">
        {/* Header Section */}
        <header className="flex flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Bike Terminal Management
          </h1>
          <button
            className={`${BUTTON_STYLES.primary} ${BUTTON_STYLES.addButton}`}
            type="button"
            onClick={() => handleOpenModal(true)}
            aria-label="Add new bike terminal"
          >
            <div className="flex flex-row items-center gap-2">
              <FaPlus aria-hidden="true" />
              Add Terminal
            </div>
          </button>
        </header>

        {/* Table Section */}
        <Card className="h-full w-full overflow-auto shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max table-auto text-center">
              <thead>
                <tr>
                  {TABLE_HEAD.map((head) => (
                    <th
                      key={head}
                      className="border-b border-blue-500 bg-blue-500 p-4"
                      scope="col"
                    >
                      <Typography
                        variant="small"
                        color="white"
                        className="font-semibold leading-none uppercase tracking-wider"
                      >
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {terminals?.length > 0 ? (
                  terminalRows
                ) : (
                  <tr>
                    <td
                      colSpan={TABLE_HEAD.length}
                      className="p-8 text-gray-500"
                    >
                      <div className="text-center">
                        <Typography variant="paragraph" className="mb-2">
                          No bike terminals found
                        </Typography>
                        <button
                          onClick={() => handleOpenModal(true)}
                          className="text-blue-500 hover:text-blue-700 underline"
                        >
                          Add your first terminal
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal */}
      <BikeTerminalModal
        open={modal.open}
        onClose={handleCloseModal}
        data={modal.selectedData}
        isCreate={modal.isCreate}
        onSuccess={() => {
          dispatch(fetchTerminals()); // Refresh data after successful operation
        }}
      />
    </Sidebar>
  );
};

export default React.memo(BikeTerminal);
