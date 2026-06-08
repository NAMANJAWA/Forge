import React, { useState, useRef, useEffect } from 'react';
import { workoutAPI } from '../utils/api';
import './Workouts.css';

const COMMON_EXERCISES = [
  'Barbell Bench Press',
  'Incline Dumbbell Press',
  'Cable Flyes',
  'Tricep Dips',
  'Overhead Press',
  'Barbell Squat',
  'Leg Press',
  'Leg Curl',
  'Leg Extension',
  'Romanian Deadlift',
  'Barbell Deadlift',
  'Barbell Rows',
  'Lat Pulldown',
  'Pull-ups',
  'Bicep Curls',
  'Dumbbell Flyes',
  'Lateral Raises',
  'Machine Chest Press',
  'Smith Machine Squat',
  'Hack Squat',
];

const Workouts = ({ userId, data }) => {
  const [activeTab, setActiveTab] = useState('log');
  const [selectedSplit, setSelectedSplit] = useState('push');
  const [exercises, setExercises] = useState([{ name: '', sets: [{ reps: '', weight: '' }] }]);
  const [searchInputs, setSearchInputs] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [expandedWorkout, setExpandedWorkout] = useState(null);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [editedSets, setEditedSets] = useState({});
  const dropdownRefs = useRef({});

  const splits = ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full Body'];

  const handleAddExercise = () => {
    setExercises([...exercises, { name: '', sets: [{ reps: '', weight: '' }] }]);
  };

  const handleExerciseChange = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);

    if (field === 'name') {
      setSearchInputs({ ...searchInputs, [index]: value });
      if (value.trim()) {
        setOpenDropdown(index);
      }
    }
  };

  const handleSetChange = (exerciseIdx, setIdx, field, value) => {
    const updated = [...exercises];
    updated[exerciseIdx].sets[setIdx][field] = value;
    setExercises(updated);
  };

  const handleAddSet = (exerciseIdx) => {
    const updated = [...exercises];
    updated[exerciseIdx].sets.push({ reps: '', weight: '' });
    setExercises(updated);
  };

  const handleRemoveSet = (exerciseIdx, setIdx) => {
    const updated = [...exercises];
    if (updated[exerciseIdx].sets.length > 1) {
      updated[exerciseIdx].sets.splice(setIdx, 1);
      setExercises(updated);
    }
  };

  const handleSelectExercise = (index, exerciseName) => {
    const updated = [...exercises];
    updated[index].name = exerciseName;
    setExercises(updated);
    setOpenDropdown(null);
    setSearchInputs({ ...searchInputs, [index]: '' });
  };

  const removeExercise = (index) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, i) => i !== index));
    }
  };

  const isExerciseValid = (exercise) => {
    return exercise.name && exercise.sets.some(set => set.reps && set.weight);
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) {
      return;
    }

    try {
      console.log('Deleting workout with ID:', workoutId);
      const response = await workoutAPI.deleteWorkout(workoutId);
      console.log('Delete response:', response);

      setMessage('✓ Workout deleted successfully!');
      setTimeout(() => {
        setMessage('');
        // Reload the page to refresh data from backend
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error deleting workout:', error.response || error.message);
      setMessage('Failed to delete workout. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEditSet = (workoutIdx, exerciseName, setIdx, field, value) => {
    const key = `${workoutIdx}-${exerciseName}-${setIdx}`;
    setEditedSets({
      ...editedSets,
      [key]: {
        ...editedSets[key],
        [field]: value
      }
    });
  };

  const handleSaveEdit = async (workout, exerciseName, setIndices) => {
    try {
      console.log('Saving edits for workout:', workout.id);

      // Get all exercises for this exercise name in this workout
      let setCount = 0;
      for (const exercise of workout.exercises) {
        const exName = exercise.exercise_name || exercise.name;
        if (exName === exerciseName) {
          const key = `${data.workouts.indexOf(workout)}-${exerciseName}-${setCount}`;
          const edited = editedSets[key];

          if (edited && edited.reps && edited.weight_kg) {
            // Update the exercise locally
            exercise.reps = parseInt(edited.reps);
            exercise.weight_kg = parseFloat(edited.weight_kg);
          }
          setCount++;
        }
      }

      setMessage('✓ Sets updated successfully!');
      setEditingWorkout(null);
      setEditedSets({});
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving edit:', error);
      setMessage('Failed to save changes. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getFilteredExercises = (index) => {
    const search = (searchInputs[index] || '').toLowerCase();
    return COMMON_EXERCISES.filter(ex => ex.toLowerCase().includes(search));
  };

  const handleSaveWorkout = async () => {
    const validExercises = exercises.filter(isExerciseValid);

    if (!validExercises.length) {
      setMessage('Please add at least one complete exercise with sets');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSaving(true);
    try {
      await workoutAPI.createWorkout({
        user_id: userId,
        split_type: selectedSplit,
        duration_minutes: 60,
        exercises: validExercises.flatMap(ex =>
          ex.sets.map(set => ({
            name: ex.name,
            sets: 1,
            reps: parseInt(set.reps),
            weight_kg: parseFloat(set.weight),
          }))
        )
      });

      setMessage('✓ Workout saved successfully!');
      setExercises([{ name: '', sets: [{ reps: '', weight: '' }] }]);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving workout:', error);
      setMessage('Failed to save workout. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRefs.current && !Object.values(dropdownRefs.current).some(ref => ref?.contains(e.target))) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="workouts">
      <div className="header-section">
        <h2>💪 Workouts</h2>
        <p>Track your strength training progress</p>
      </div>

      {/* Tabs */}
      <div className="workout-tabs">
        <button
          className={`tab-btn ${activeTab === 'log' ? 'active' : ''}`}
          onClick={() => setActiveTab('log')}
        >
          📝 Log New
        </button>
        <button
          className={`tab-btn ${activeTab === 'logged' ? 'active' : ''}`}
          onClick={() => setActiveTab('logged')}
        >
          📊 Logged Workouts
        </button>
      </div>

      {/* Log New Workout Tab */}
      {activeTab === 'log' && <div className="card">
        <h3>📝 Log New Workout</h3>

        <div className="form-group">
          <label>Select Workout Split</label>
          <div className="split-buttons">
            {splits.map(split => (
              <button
                key={split}
                className={`split-btn ${selectedSplit.toLowerCase() === split.toLowerCase() ? 'active' : ''}`}
                onClick={() => setSelectedSplit(split.toLowerCase())}
              >
                {split}
              </button>
            ))}
          </div>
        </div>

        <div className="exercises-list">
          {exercises.map((exercise, exIdx) => (
            <div key={exIdx} className="exercise-card">
              <div className="exercise-header">
                <div className="exercise-input-wrapper" ref={el => dropdownRefs.current[exIdx] = el}>
                  <input
                    type="text"
                    placeholder="Search exercise..."
                    value={exercise.name}
                    onChange={(e) => handleExerciseChange(exIdx, 'name', e.target.value)}
                    className="exercise-input"
                    autoComplete="off"
                  />
                  {openDropdown === exIdx && exercise.name && getFilteredExercises(exIdx).length > 0 && (
                    <div className="exercise-dropdown">
                      {getFilteredExercises(exIdx).map(exName => (
                        <div
                          key={exName}
                          className="dropdown-item"
                          onClick={() => handleSelectExercise(exIdx, exName)}
                        >
                          {exName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className="btn-remove"
                  onClick={() => removeExercise(exIdx)}
                  title="Remove exercise"
                >
                  ×
                </button>
              </div>

              {/* Sets for this exercise */}
              <div className="sets-container">
                {exercise.sets.map((set, setIdx) => (
                  <div key={setIdx} className="set-row">
                    <span className="set-number">Set {setIdx + 1}</span>
                    <input
                      type="number"
                      placeholder="Reps"
                      value={set.reps}
                      onChange={(e) => handleSetChange(exIdx, setIdx, 'reps', e.target.value)}
                      className="input-small"
                      min="1"
                    />
                    <span className="separator">@</span>
                    <input
                      type="number"
                      placeholder="Weight (kg)"
                      value={set.weight}
                      onChange={(e) => handleSetChange(exIdx, setIdx, 'weight', e.target.value)}
                      className="input-small"
                      step="0.5"
                      min="0"
                    />
                    {exercise.sets.length > 1 && (
                      <button
                        className="btn-remove-set"
                        onClick={() => handleRemoveSet(exIdx, setIdx)}
                        title="Remove set"
                      >
                        −
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                className="btn-add-set"
                onClick={() => handleAddSet(exIdx)}
              >
                + Add Set
              </button>
            </div>
          ))}
        </div>

        <button className="btn btn-secondary" onClick={handleAddExercise}>
          + Add Exercise
        </button>

        <button
          className="btn btn-primary"
          onClick={handleSaveWorkout}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Workout'}
        </button>

        {message && <div className="message-alert">{message}</div>}
      </div>}

      {/* Logged Workouts Tab */}
      {activeTab === 'logged' && <div className="logged-workouts-container">
        <h3>📊 Your Logged Workouts</h3>
        {data.workouts && data.workouts.length > 0 ? (
          data.workouts.slice(0, 10).map((workout, idx) => {
            // Group exercises by name
            const grouped = {};
            if (workout.exercises) {
              workout.exercises.forEach(ex => {
                const exName = ex.exercise_name || ex.name; // Use exercise_name from DB or name from form
                if (!grouped[exName]) {
                  grouped[exName] = [];
                }
                grouped[exName].push(ex);
              });
            }

            const isExpanded = expandedWorkout === idx;

            return (
              <div key={idx} className="workout-card">
                {/* Workout Header - Always visible, clickable to expand */}
                <div
                  className="workout-card-header"
                  onClick={() => setExpandedWorkout(isExpanded ? null : idx)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="workout-summary">
                    <span className="badge-small">{workout.split_type}</span>
                    <span className="date-small">{new Date(workout.date).toLocaleDateString()}</span>
                    <span className="exercise-count-badge">{Object.keys(grouped).length} exercises</span>
                  </div>
                  <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                </div>

                {/* Workout Action Buttons - Only shown when expanded and not editing */}
                {isExpanded && editingWorkout !== idx && (
                  <div className="workout-action-buttons">
                    <button
                      className="btn-edit-workout"
                      onClick={() => {
                        setEditingWorkout(idx);
                        setEditedSets({});
                      }}
                    >
                      ✏️ Edit Sets
                    </button>
                    <button
                      className="btn-delete-workout"
                      onClick={() => handleDeleteWorkout(workout.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}

                {/* Exercise Details - Only shown when in edit mode */}
                {editingWorkout === idx && (
                  <div className="exercises-list-display">
                    {Object.keys(grouped).length > 0 ? (
                      Object.entries(grouped).map(([exName, sets], exIdx) => {
                        const isEditing = editingWorkout === idx && Object.keys(editedSets).some(k => k.startsWith(`${idx}-${exName}`));

                        return (
                          <div key={exIdx} className="exercise-block">
                            <div className="exercise-header-block">
                              <div className="exercise-title-row">
                                <h4 className="exercise-name-main">{exName}</h4>
                                {editingWorkout === idx && (
                                  <div className="edit-actions">
                                    <button
                                      className="btn-save-edit"
                                      onClick={() => handleSaveEdit(workout, exName, Object.keys(sets).map((_, i) => i))}
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="btn-cancel-edit"
                                      onClick={() => {
                                        setEditingWorkout(null);
                                        setEditedSets({});
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="sets-list">
                              {sets.map((set, setIdx) => {
                                const editKey = `${idx}-${exName}-${setIdx}`;
                                const edited = editedSets[editKey];

                                return (
                                  <div key={setIdx} className={`set-item ${isEditing ? 'editing' : ''}`}>
                                    <span className="set-number">Set {setIdx + 1}</span>
                                    {isEditing ? (
                                      <div className="set-edit-inputs">
                                        <input
                                          type="number"
                                          value={edited?.reps || set.reps}
                                          onChange={(e) => handleEditSet(idx, exName, setIdx, 'reps', e.target.value)}
                                          className="edit-input-small"
                                          min="1"
                                        />
                                        <span className="separator">@</span>
                                        <input
                                          type="number"
                                          value={edited?.weight_kg || set.weight_kg}
                                          onChange={(e) => handleEditSet(idx, exName, setIdx, 'weight_kg', e.target.value)}
                                          className="edit-input-small"
                                          step="0.5"
                                          min="0"
                                        />
                                      </div>
                                    ) : (
                                      <span className="set-data">{set.reps}R @ {set.weight_kg}kg</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-muted">No exercises logged</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-muted">No workouts yet. Log one from the "Log New" tab!</p>
        )}
      </div>}
    </div>
  );
};

export default Workouts;
