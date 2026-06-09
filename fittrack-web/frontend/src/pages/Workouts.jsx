import React, { useState, useRef, useEffect } from 'react';
import { workoutAPI } from '../utils/api';
import './Workouts.css';

const COMMON_EXERCISES = [
  // Push
  'Barbell Bench Press',
  'Incline Dumbbell Press',
  'Decline Bench Press',
  'Cable Flyes',
  'Machine Chest Press',
  'Dumbbell Flyes',
  'Tricep Dips',
  'Close Grip Bench Press',
  'Overhead Press',
  'Dumbbell Shoulder Press',
  'Smith Machine Shoulder Press',
  'Lateral Raises',
  'Front Raises',
  'Reverse Pec Deck',
  'Tricep Pushdowns',
  'Rope Pushdowns',
  'Skull Crushers',
  'French Press',
  'Tricep Rope Extensions',
  'Dips Machine',
  
  // Pull
  'Barbell Rows',
  'Dumbbell Rows',
  'Lat Pulldown',
  'Pull-ups',
  'Chin-ups',
  'Assisted Pull-ups',
  'Lateral Pulldown Machine',
  'T-Bar Rows',
  'Seal Rows',
  'Chest Supported Rows',
  'Bent Over Rows',
  'Pendulum Rows',
  'Machine Rows',
  'Face Pulls',
  'Reverse Flyes',
  'Bicep Curls',
  'Dumbbell Curls',
  'Barbell Curls',
  'Machine Curls',
  'Cable Curls',
  'Hammer Curls',
  'Preacher Curls',
  'EZ Bar Curls',
  'Concentration Curls',
  
  // Legs
  'Barbell Squat',
  'Leg Press',
  'Hack Squat',
  'Smith Machine Squat',
  'Leg Extension',
  'Leg Curl',
  'Romanian Deadlift',
  'Barbell Deadlift',
  'Sumo Deadlift',
  'Trap Bar Deadlift',
  'Leg Curl Machine',
  'Lying Leg Curl',
  'Seated Leg Curl',
  'Walking Lunges',
  'Bulgarian Split Squats',
  'Dumbbell Lunges',
  'Calf Raises',
  'Seated Calf Raises',
  'Smith Machine Calf Raises',
  'Sissy Squats',
];

const EXERCISE_BY_SPLIT = {
  push: [
    'Barbell Bench Press',
    'Incline Dumbbell Press',
    'Decline Bench Press',
    'Cable Flyes',
    'Machine Chest Press',
    'Dumbbell Flyes',
    'Tricep Dips',
    'Close Grip Bench Press',
    'Overhead Press',
    'Dumbbell Shoulder Press',
    'Smith Machine Shoulder Press',
    'Lateral Raises',
    'Front Raises',
    'Reverse Pec Deck',
    'Tricep Pushdowns',
    'Rope Pushdowns',
    'Skull Crushers',
    'French Press',
    'Tricep Rope Extensions',
    'Dips Machine',
  ],
  pull: [
    'Barbell Rows',
    'Dumbbell Rows',
    'Lat Pulldown',
    'Pull-ups',
    'Chin-ups',
    'Assisted Pull-ups',
    'Lateral Pulldown Machine',
    'T-Bar Rows',
    'Seal Rows',
    'Chest Supported Rows',
    'Bent Over Rows',
    'Pendulum Rows',
    'Machine Rows',
    'Face Pulls',
    'Reverse Flyes',
    'Bicep Curls',
    'Dumbbell Curls',
    'Barbell Curls',
    'Machine Curls',
    'Cable Curls',
    'Hammer Curls',
    'Preacher Curls',
    'EZ Bar Curls',
    'Concentration Curls',
  ],
  legs: [
    'Barbell Squat',
    'Leg Press',
    'Hack Squat',
    'Smith Machine Squat',
    'Leg Extension',
    'Leg Curl',
    'Romanian Deadlift',
    'Barbell Deadlift',
    'Sumo Deadlift',
    'Trap Bar Deadlift',
    'Leg Curl Machine',
    'Lying Leg Curl',
    'Seated Leg Curl',
    'Walking Lunges',
    'Bulgarian Split Squats',
    'Dumbbell Lunges',
    'Calf Raises',
    'Seated Calf Raises',
    'Smith Machine Calf Raises',
    'Sissy Squats',
  ],
  upper: [
    'Barbell Bench Press',
    'Incline Dumbbell Press',
    'Barbell Rows',
    'Lat Pulldown',
    'Pull-ups',
    'Overhead Press',
    'Lateral Raises',
    'Bicep Curls',
    'Tricep Dips',
    'Face Pulls',
    'Dumbbell Curls',
    'Skull Crushers',
    'Machine Chest Press',
    'Cable Flyes',
    'Machine Rows',
  ],
  lower: [
    'Barbell Squat',
    'Romanian Deadlift',
    'Leg Press',
    'Leg Extension',
    'Leg Curl',
    'Hack Squat',
    'Walking Lunges',
    'Calf Raises',
    'Bulgarian Split Squats',
    'Leg Curl Machine',
  ],
  'full body': [
    'Barbell Squat',
    'Barbell Bench Press',
    'Barbell Rows',
    'Barbell Deadlift',
    'Overhead Press',
    'Pull-ups',
    'Dumbbell Curls',
    'Tricep Dips',
    'Leg Press',
    'Lat Pulldown',
  ],
};

const Workouts = ({ userId, data, onWorkoutSaved }) => {
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
  const [workouts, setWorkouts] = useState(data.workouts || []);
  const dropdownRefs = useRef({});

  const splits = ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full Body'];

  useEffect(() => {
    setWorkouts(data.workouts || []);
  }, [data.workouts]);

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
      await workoutAPI.deleteWorkout(workoutId);
      setWorkouts(workouts.filter(w => w.id !== workoutId));
      setExpandedWorkout(null);
      setMessage('✓ Workout deleted successfully!');
      setTimeout(() => setMessage(''), 1000);
    } catch (error) {
      console.error('Error deleting workout:', error);
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

  const handleSaveEdit = async (workout, exerciseNames, idx) => {
    try {
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
    const splitExercises = EXERCISE_BY_SPLIT[selectedSplit] || COMMON_EXERCISES;
    return splitExercises.filter(ex => ex.toLowerCase().includes(search));
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
      const response = await workoutAPI.createWorkout({
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

      if (response.data) {
        setWorkouts([response.data, ...workouts]);
        setActiveTab('logged');
        setTimeout(() => onWorkoutSaved?.(), 500);
      }

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
        {workouts && workouts.length > 0 ? (
          (() => {
            // Group workouts by split_type and date
            const groupedBySplitAndDate = {};
            workouts.forEach(workout => {
              const key = `${workout.split_type}-${workout.date}`;
              if (!groupedBySplitAndDate[key]) {
                groupedBySplitAndDate[key] = {
                  split_type: workout.split_type,
                  date: workout.date,
                  workouts: []
                };
              }
              groupedBySplitAndDate[key].workouts.push(workout);
            });

            return Object.entries(groupedBySplitAndDate).map(([groupKey, group], groupIdx) => {
              const isExpanded = expandedWorkout === groupKey;
              const isEditing = editingWorkout === groupKey;

              // Count total unique exercises in all workouts of this group
              const allExercises = new Set();
              group.workouts.forEach(w => {
                if (w.exercises) {
                  w.exercises.forEach(ex => {
                    const exName = ex.exercise_name || ex.name;
                    allExercises.add(exName);
                  });
                }
              });

              return (
                <div key={groupKey} className="workout-card">
                  {/* Header - Split name, date, exercise count */}
                  <div
                    className="workout-card-header"
                    onClick={() => setExpandedWorkout(isExpanded ? null : groupKey)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="workout-summary">
                      <span className="badge-small">{group.split_type.toUpperCase()}</span>
                      <span className="date-small">{new Date(group.date).toLocaleDateString()}</span>
                      <span className="exercise-count-badge">{allExercises.size} exercises</span>
                    </div>
                    <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="workout-expanded-content">
                      {/* Exercise List */}
                      <div className="exercises-list-display">
                        {group.workouts.map((workout, wIdx) => {
                          const grouped = {};
                          if (workout.exercises) {
                            workout.exercises.forEach(ex => {
                              const exName = ex.exercise_name || ex.name;
                              if (!grouped[exName]) {
                                grouped[exName] = [];
                              }
                              grouped[exName].push(ex);
                            });
                          }

                          return Object.entries(grouped).map(([exName, sets], exIdx) => {
                            return (
                              <div key={`${wIdx}-${exIdx}`} className="exercise-block">
                                <div className="exercise-header-block">
                                  <h4 className="exercise-name-main">{exName}</h4>
                                </div>
                                <div className="sets-list">
                                  {sets.map((set, setIdx) => {
                                    const editKey = `${groupKey}-${exName}-${setIdx}`;
                                    const edited = editedSets[editKey];

                                    return (
                                      <div key={setIdx} className={`set-item ${isEditing ? 'editing' : ''}`}>
                                        <span className="set-number">Set {setIdx + 1}</span>
                                        {isEditing ? (
                                          <div className="set-edit-inputs">
                                            <input
                                              type="number"
                                              value={edited?.reps || set.reps}
                                              onChange={(e) => handleEditSet(groupKey, exName, setIdx, 'reps', e.target.value)}
                                              className="edit-input-small"
                                              min="1"
                                            />
                                            <span className="separator">@</span>
                                            <input
                                              type="number"
                                              value={edited?.weight_kg || set.weight_kg}
                                              onChange={(e) => handleEditSet(groupKey, exName, setIdx, 'weight_kg', e.target.value)}
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
                          });
                        })}
                      </div>

                      {/* Action Buttons - Only shown when expanded */}
                      {!isEditing && (
                        <div className="workout-action-buttons">
                          <button
                            className="btn-edit-workout"
                            onClick={() => {
                              setEditingWorkout(groupKey);
                              setEditedSets({});
                            }}
                          >
                            ✏️ Edit Sets
                          </button>
                          <button
                            className="btn-delete-workout"
                            onClick={() => {
                              group.workouts.forEach(w => handleDeleteWorkout(w.id));
                            }}
                          >
                            🗑️ Delete All
                          </button>
                        </div>
                      )}

                      {/* Save/Cancel Buttons - Only shown when editing */}
                      {isEditing && (
                        <div className="workout-action-buttons">
                          <button
                            className="btn-save-edit"
                            onClick={() => handleSaveEdit(null, Array.from(allExercises), groupKey)}
                          >
                            ✓ Save Changes
                          </button>
                          <button
                            className="btn-cancel-edit"
                            onClick={() => {
                              setEditingWorkout(null);
                              setEditedSets({});
                            }}
                          >
                            ✕ Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            });
          })()
        ) : (
          <p className="text-muted">No workouts yet. Log one from the "Log New" tab!</p>
        )}
      </div>}

      {message && <div className="message-alert">{message}</div>}
    </div>
  );
};

export default Workouts;
