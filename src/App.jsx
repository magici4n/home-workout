import { useEffect, useState } from "react";
import "./App.css";

const basicExercises = [
  "풀업",
  "스쿼트",
  "푸쉬업",
];

const DEFAULT_BASIC_PLANS = {
  풀업: {
    reps: 10,
    sets: 5,
  },

  스쿼트: {
    reps: 20,
    sets: 5,
  },

  푸쉬업: {
    reps: 15,
    sets: 5,
  },
};

const DEFAULT_EXTRA_PLAN = {
  reps: 10,
  sets: 5,
};

function getDateKey(date = new Date()) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime(seconds) {
  const minutes =
    Math.floor(seconds / 60);

  const remainSeconds =
    seconds % 60;

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${String(remainSeconds).padStart(
    2,
    "0"
  )}`;
}

function App() {
  const today = getDateKey();

  /* =========================
     현재 운동
  ========================= */

  const [
    currentExercise,
    setCurrentExercise,
  ] = useState("풀업");

  const [
    currentReps,
    setCurrentReps,
  ] = useState(
    DEFAULT_BASIC_PLANS["풀업"].reps
  );

  /* =========================
     추가 운동
  ========================= */

  const [
    isExtraOpen,
    setIsExtraOpen,
  ] = useState(false);

  const [
    extraExercises,
    setExtraExercises,
  ] = useState(() => {
    const saved =
      localStorage.getItem(
        "extraExercisesV1"
      );

    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const [
    newExerciseName,
    setNewExerciseName,
  ] = useState("");

  const [
    exerciseError,
    setExerciseError,
  ] = useState("");

  /* =========================
     운동별 목표
  ========================= */

  const [plans, setPlans] =
    useState(() => {
      /*
        V3가 있으면 그대로 사용
      */
      const savedV3 =
        localStorage.getItem(
          "workoutPlansV3"
        );

      if (savedV3) {
        try {
          return {
            ...DEFAULT_BASIC_PLANS,
            ...JSON.parse(savedV3),
          };
        } catch {
          return {
            ...DEFAULT_BASIC_PLANS,
          };
        }
      }

      /*
        기존 V2를 사용했다면
        횟수는 유지하고 기본 세트는
        이번 버전부터 5세트로 변경
      */
      const savedV2 =
        localStorage.getItem(
          "workoutPlansV2"
        );

      if (savedV2) {
        try {
          const oldPlans =
            JSON.parse(savedV2);

          return {
            풀업: {
              reps:
                oldPlans["풀업"]
                  ?.reps ?? 10,
              sets: 5,
            },

            스쿼트: {
              reps:
                oldPlans["스쿼트"]
                  ?.reps ?? 20,
              sets: 5,
            },

            푸쉬업: {
              reps:
                oldPlans["푸쉬업"]
                  ?.reps ?? 15,
              sets: 5,
            },
          };
        } catch {
          return {
            ...DEFAULT_BASIC_PLANS,
          };
        }
      }

      return {
        ...DEFAULT_BASIC_PLANS,
      };
    });

  /* =========================
     날짜별 운동 기록
  ========================= */

  const [history, setHistory] =
    useState(() => {
      const savedHistory =
        localStorage.getItem(
          "workoutHistoryV1"
        );

      if (savedHistory) {
        try {
          return JSON.parse(
            savedHistory
          );
        } catch {
          return {};
        }
      }

      return {};
    });

  const [trackingStartDate] =
    useState(() => {
      return (
        localStorage.getItem(
          "trackingStartDate"
        ) || today
      );
    });

  const records =
    history[today]?.records ?? [];

  const currentPlan =
    plans[currentExercise] ??
    DEFAULT_EXTRA_PLAN;

  const currentExerciseRecords =
    records.filter(
      (record) =>
        record.exercise ===
        currentExercise
    );

  const completedSets =
    currentExerciseRecords.length;

  const isCompleted =
    completedSets >=
    currentPlan.sets;

  /* =========================
     달력
  ========================= */

  const now = new Date();

  const [
    calendarMonth,
    setCalendarMonth,
  ] = useState(
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    )
  );

  /* =========================
     휴식 타이머
  ========================= */

  const [restTime, setRestTime] =
    useState(60);

  const [
    remainingTime,
    setRemainingTime,
  ] = useState(60);

  const [
    isTimerRunning,
    setIsTimerRunning,
  ] = useState(false);

  const [
    timerEndTime,
    setTimerEndTime,
  ] = useState(null);

  /* =========================
     저장
  ========================= */

  useEffect(() => {
    localStorage.setItem(
      "workoutPlansV3",
      JSON.stringify(plans)
    );
  }, [plans]);

  useEffect(() => {
    localStorage.setItem(
      "extraExercisesV1",
      JSON.stringify(
        extraExercises
      )
    );
  }, [extraExercises]);

  useEffect(() => {
    localStorage.setItem(
      "workoutHistoryV1",
      JSON.stringify(history)
    );
  }, [history]);

  useEffect(() => {
    localStorage.setItem(
      "trackingStartDate",
      trackingStartDate
    );
  }, [trackingStartDate]);

  /* =========================
     기본 루틴 완료 확인
  ========================= */

  useEffect(() => {
    const basicRoutineCompleted =
      basicExercises.every(
        (exercise) => {
          const completed =
            records.filter(
              (record) =>
                record.exercise ===
                exercise
            ).length;

          return (
            completed >=
            plans[exercise].sets
          );
        }
      );

    setHistory((prevHistory) => {
      const todayData =
        prevHistory[today] ?? {
          records: [],
          basicRoutineCompleted:
            false,
        };

      if (
        todayData.basicRoutineCompleted ===
        basicRoutineCompleted
      ) {
        return prevHistory;
      }

      return {
        ...prevHistory,

        [today]: {
          ...todayData,

          basicRoutineCompleted,
        },
      };
    });
  }, [
    records,
    plans,
    today,
  ]);

  /* =========================
     타이머
  ========================= */

  useEffect(() => {
    if (
      !isTimerRunning ||
      !timerEndTime
    ) {
      return;
    }

    const intervalId =
      setInterval(() => {
        const difference =
          timerEndTime -
          Date.now();

        const secondsLeft =
          Math.max(
            0,
            Math.ceil(
              difference / 1000
            )
          );

        setRemainingTime(
          secondsLeft
        );

        if (secondsLeft <= 0) {
          setIsTimerRunning(
            false
          );

          setTimerEndTime(
            null
          );
        }
      }, 250);

    return () =>
      clearInterval(intervalId);
  }, [
    isTimerRunning,
    timerEndTime,
  ]);

  /* =========================
     기록 변경
  ========================= */

  const updateTodayRecords = (
    updater
  ) => {
    setHistory(
      (prevHistory) => {
        const todayData =
          prevHistory[today] ?? {
            records: [],

            basicRoutineCompleted:
              false,
          };

        const nextRecords =
          typeof updater ===
          "function"
            ? updater(
                todayData.records
              )
            : updater;

        return {
          ...prevHistory,

          [today]: {
            ...todayData,

            records:
              nextRecords,
          },
        };
      }
    );
  };

  const getCompletedSets = (
    exercise
  ) => {
    return records.filter(
      (record) =>
        record.exercise ===
        exercise
    ).length;
  };

  /* =========================
     운동 선택
  ========================= */

  const selectExercise = (
    exercise
  ) => {
    setCurrentExercise(
      exercise
    );

    setCurrentReps(
      plans[exercise]?.reps ??
        DEFAULT_EXTRA_PLAN.reps
    );
  };

  /* =========================
     추가 운동 생성
  ========================= */

  const addExtraExercise = (
    event
  ) => {
    event.preventDefault();

    const name =
      newExerciseName.trim();

    if (!name) {
      setExerciseError(
        "운동 이름을 입력해주세요."
      );

      return;
    }

    const duplicated =
      basicExercises.includes(
        name
      ) ||
      extraExercises.includes(
        name
      );

    if (duplicated) {
      setExerciseError(
        "이미 등록된 운동입니다."
      );

      return;
    }

    setExtraExercises(
      (prev) => [
        ...prev,
        name,
      ]
    );

    setPlans((prev) => ({
      ...prev,

      [name]: {
        ...DEFAULT_EXTRA_PLAN,
      },
    }));

    setCurrentExercise(name);

    setCurrentReps(
      DEFAULT_EXTRA_PLAN.reps
    );

    setNewExerciseName("");

    setExerciseError("");
  };

  /* =========================
     추가 운동 삭제
  ========================= */

  const deleteExtraExercise = (
    exercise
  ) => {
    setExtraExercises(
      (prev) =>
        prev.filter(
          (item) =>
            item !== exercise
        )
    );

    setPlans((prev) => {
      const nextPlans = {
        ...prev,
      };

      delete nextPlans[
        exercise
      ];

      return nextPlans;
    });

    /*
      삭제된 운동을 현재 보고
      있었다면 풀업으로 이동
    */
    if (
      currentExercise ===
      exercise
    ) {
      setCurrentExercise(
        "풀업"
      );

      setCurrentReps(
        plans["풀업"].reps
      );
    }
  };

  /* =========================
     목표 변경
  ========================= */

  const changePlanReps = (
    amount
  ) => {
    const newReps =
      Math.max(
        1,
        currentPlan.reps +
          amount
      );

    setPlans((prev) => ({
      ...prev,

      [currentExercise]: {
        ...prev[
          currentExercise
        ],

        reps: newReps,
      },
    }));

    setCurrentReps(
      newReps
    );
  };

  const changePlanSets = (
    amount
  ) => {
    const minimumSets =
      Math.max(
        1,
        completedSets
      );

    const newSets =
      Math.max(
        minimumSets,

        currentPlan.sets +
          amount
      );

    setPlans((prev) => ({
      ...prev,

      [currentExercise]: {
        ...prev[
          currentExercise
        ],

        sets: newSets,
      },
    }));
  };

  const changeCurrentReps = (
    amount
  ) => {
    setCurrentReps(
      (prev) =>
        Math.max(
          1,
          prev + amount
        )
    );
  };

  /* =========================
     타이머 함수
  ========================= */

  const startTimer = (
    seconds = remainingTime
  ) => {
    let startSeconds =
      seconds;

    if (
      startSeconds <= 0
    ) {
      startSeconds =
        restTime;

      setRemainingTime(
        restTime
      );
    }

    setTimerEndTime(
      Date.now() +
        startSeconds * 1000
    );

    setIsTimerRunning(
      true
    );
  };

  const pauseTimer = () => {
    setIsTimerRunning(
      false
    );

    setTimerEndTime(null);
  };

  const resetTimer = () => {
    setIsTimerRunning(
      false
    );

    setTimerEndTime(null);

    setRemainingTime(
      restTime
    );
  };

  const changeRestTime = (
    seconds
  ) => {
    setRestTime(seconds);

    setRemainingTime(
      seconds
    );

    setIsTimerRunning(
      false
    );

    setTimerEndTime(null);
  };

  /* =========================
     세트 완료
  ========================= */

  const completeSet = () => {
    if (isCompleted) {
      return;
    }

    const newRecord = {
      id: Date.now(),

      exercise:
        currentExercise,

      reps: currentReps,
    };

    updateTodayRecords(
      (prev) => [
        ...prev,
        newRecord,
      ]
    );

    const willFinishExercise =
      completedSets + 1 >=
      currentPlan.sets;

    /*
      현재 운동이 아직
      끝나지 않았다면
      휴식 타이머 시작
    */
    if (
      !willFinishExercise
    ) {
      setCurrentReps(
        currentPlan.reps
      );

      setRemainingTime(
        restTime
      );

      setTimerEndTime(
        Date.now() +
          restTime * 1000
      );

      setIsTimerRunning(
        true
      );

      return;
    }

    /*
      기본 루틴 자동 이동

      풀업
      ↓
      스쿼트
      ↓
      푸쉬업
    */
    const basicIndex =
      basicExercises.indexOf(
        currentExercise
      );

    if (
      basicIndex !== -1 &&
      basicIndex <
        basicExercises.length -
          1
    ) {
      const nextExercise =
        basicExercises[
          basicIndex + 1
        ];

      setCurrentExercise(
        nextExercise
      );

      setCurrentReps(
        plans[nextExercise]
          .reps
      );
    }
  };

  /* =========================
     운동 기록 초기화
  ========================= */

  const resetCurrentExercise =
    () => {
      updateTodayRecords(
        (prev) =>
          prev.filter(
            (record) =>
              record.exercise !==
              currentExercise
          )
      );

      setCurrentReps(
        currentPlan.reps
      );
    };

  const resetToday = () => {
    updateTodayRecords([]);

    setCurrentExercise(
      "풀업"
    );

    setCurrentReps(
      plans["풀업"].reps
    );
  };

  /* =========================
     오늘 기록 요약
  ========================= */

  const workoutSummary =
    Object.values(
      records.reduce(
        (summary, record) => {
          if (
            !summary[
              record.exercise
            ]
          ) {
            summary[
              record.exercise
            ] = {
              exercise:
                record.exercise,

              reps: [],
            };
          }

          summary[
            record.exercise
          ].reps.push(
            record.reps
          );

          return summary;
        },
        {}
      )
    );

  const completedBasicExercises =
    basicExercises.filter(
      (exercise) => {
        return (
          getCompletedSets(
            exercise
          ) >=
          plans[exercise].sets
        );
      }
    ).length;

  /* =========================
     달력
  ========================= */

  const calendarYear =
    calendarMonth.getFullYear();

  const calendarMonthNumber =
    calendarMonth.getMonth();

  const firstDay =
    new Date(
      calendarYear,
      calendarMonthNumber,
      1
    ).getDay();

  const daysInMonth =
    new Date(
      calendarYear,
      calendarMonthNumber + 1,
      0
    ).getDate();

  const calendarCells = [];

  for (
    let i = 0;
    i < firstDay;
    i++
  ) {
    calendarCells.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    calendarCells.push(day);
  }

  const movePreviousMonth =
    () => {
      setCalendarMonth(
        new Date(
          calendarYear,
          calendarMonthNumber -
            1,
          1
        )
      );
    };

  const moveNextMonth =
    () => {
      setCalendarMonth(
        new Date(
          calendarYear,
          calendarMonthNumber +
            1,
          1
        )
      );
    };

  const getCalendarStatus = (
    day
  ) => {
    const date = new Date(
      calendarYear,
      calendarMonthNumber,
      day
    );

    const dateKey =
      getDateKey(date);

    if (dateKey > today) {
      return "future";
    }

    if (
      dateKey <
      trackingStartDate
    ) {
      return "before";
    }

    if (
      history[dateKey]
        ?.basicRoutineCompleted
    ) {
      return "done";
    }

    return "missed";
  };

  return (
    <main className="app">
      {/* 헤더 */}

      <header className="header">
        <p className="subtitle">
          HOME WORKOUT
        </p>

        <h1>오늘의 홈트</h1>

        <p className="date">
          {new Date().toLocaleDateString(
            "ko-KR",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "short",
            }
          )}
        </p>
      </header>

      {/* 기본 루틴 */}

      <section className="card">
        <div className="routine-header">
          <div>
            <p className="label">
              DAILY ROUTINE
            </p>

            <h2>기본 루틴</h2>
          </div>

          <strong className="routine-progress">
            {
              completedBasicExercises
            }{" "}
            / 3 완료
          </strong>
        </div>

        <div className="basic-routine-list">
          {basicExercises.map(
            (exercise) => {
              const completed =
                getCompletedSets(
                  exercise
                );

              const target =
                plans[exercise].sets;

              const exerciseCompleted =
                completed >= target;

              return (
                <button
                  key={exercise}
                  className={
                    currentExercise ===
                    exercise
                      ? "routine-button active"
                      : "routine-button"
                  }
                  onClick={() =>
                    selectExercise(
                      exercise
                    )
                  }
                >
                  <div>
                    <strong>
                      {exercise}
                    </strong>

                    <span>
                      {
                        plans[exercise]
                          .reps
                      }
                      회 ×{" "}
                      {
                        plans[exercise]
                          .sets
                      }
                      세트
                    </span>
                  </div>

                  <span
                    className={
                      exerciseCompleted
                        ? "routine-status completed"
                        : "routine-status"
                    }
                  >
                    {exerciseCompleted
                      ? "완료 ✓"
                      : `${completed} / ${target}`}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </section>

      {/* 추가 운동 */}

      <section className="card extra-card">
        <button
          className="extra-toggle-button"
          onClick={() =>
            setIsExtraOpen(
              (prev) => !prev
            )
          }
          aria-expanded={
            isExtraOpen
          }
        >
          <div>
            <p className="label">
              OPTIONAL
            </p>

            <strong>
              추가 운동
            </strong>
          </div>

          <span>
            {isExtraOpen
              ? "접기 ▲"
              : "보기 ▼"}
          </span>
        </button>

        {isExtraOpen && (
          <div className="extra-content">
            <form
              className="exercise-add-form"
              onSubmit={
                addExtraExercise
              }
            >
              <label
                htmlFor="newExercise"
              >
                운동 추가
              </label>

              <div className="exercise-add-row">
                <input
                  id="newExercise"
                  type="text"
                  value={
                    newExerciseName
                  }
                  onChange={(event) => {
                    setNewExerciseName(
                      event.target.value
                    );

                    setExerciseError(
                      ""
                    );
                  }}
                  placeholder="예: 딥스"
                  maxLength={20}
                />

                <button
                  type="submit"
                >
                  + 추가
                </button>
              </div>

              {exerciseError && (
                <p className="exercise-error">
                  {exerciseError}
                </p>
              )}
            </form>

            {extraExercises.length ===
            0 ? (
              <p className="extra-empty">
                추가한 운동이
                없습니다.
              </p>
            ) : (
              <div className="custom-exercise-list">
                {extraExercises.map(
                  (exercise) => (
                    <div
                      key={
                        exercise
                      }
                      className={
                        currentExercise ===
                        exercise
                          ? "custom-exercise-row active"
                          : "custom-exercise-row"
                      }
                    >
                      <button
                        type="button"
                        className="custom-exercise-select"
                        onClick={() =>
                          selectExercise(
                            exercise
                          )
                        }
                      >
                        <strong>
                          {exercise}
                        </strong>

                        <span>
                          {plans[
                            exercise
                          ]?.reps ??
                            10}
                          회 ×{" "}
                          {plans[
                            exercise
                          ]?.sets ??
                            5}
                          세트
                        </span>
                      </button>

                      <button
                        type="button"
                        className="custom-exercise-delete"
                        onClick={() =>
                          deleteExtraExercise(
                            exercise
                          )
                        }
                        aria-label={`${exercise} 삭제`}
                      >
                        삭제
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 현재 운동 */}

      <section className="card workout-card">
        <div className="workout-header">
          <div>
            <p className="label">
              CURRENT EXERCISE
            </p>

            <h2>
              {currentExercise}
            </h2>
          </div>

          <strong className="set-progress">
            {completedSets} /{" "}
            {currentPlan.sets}
            세트
          </strong>
        </div>

        <div className="goal-box">
          <p className="goal-title">
            목표 설정
          </p>

          <div className="setting-row">
            <span>
              1세트당
            </span>

            <div className="stepper">
              <button
                onClick={() =>
                  changePlanReps(
                    -1
                  )
                }
              >
                −
              </button>

              <strong>
                {currentPlan.reps}
                회
              </strong>

              <button
                onClick={() =>
                  changePlanReps(
                    1
                  )
                }
              >
                +
              </button>
            </div>
          </div>

          <div className="setting-row">
            <span>
              총 세트
            </span>

            <div className="stepper">
              <button
                onClick={() =>
                  changePlanSets(
                    -1
                  )
                }
              >
                −
              </button>

              <strong>
                {currentPlan.sets}
                세트
              </strong>

              <button
                onClick={() =>
                  changePlanSets(
                    1
                  )
                }
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="progress-area">
          <div className="progress-text">
            <span>
              진행률
            </span>

            <strong>
              {Math.round(
                Math.min(
                  1,
                  completedSets /
                    currentPlan.sets
                ) * 100
              )}
              %
            </strong>
          </div>

          <div className="progress-bar">
            <div
              className="progress-value"
              style={{
                width: `${Math.min(
                  100,
                  (completedSets /
                    currentPlan.sets) *
                    100
                )}%`,
              }}
            />
          </div>
        </div>

        {!isCompleted ? (
          <>
            <div className="current-set">
              <p>
                {completedSets +
                  1}
                세트 실제 횟수
              </p>

              <div className="current-reps-control">
                <button
                  onClick={() =>
                    changeCurrentReps(
                      -1
                    )
                  }
                >
                  −
                </button>

                <div>
                  <strong>
                    {
                      currentReps
                    }
                  </strong>

                  <span>
                    회
                  </span>
                </div>

                <button
                  onClick={() =>
                    changeCurrentReps(
                      1
                    )
                  }
                >
                  +
                </button>
              </div>
            </div>

            <button
              className="complete-button"
              onClick={
                completeSet
              }
            >
              {completedSets +
                1}
              세트 완료
            </button>
          </>
        ) : (
          <div className="completed-box">
            <strong>
              {currentExercise}{" "}
              완료 ✓
            </strong>

            <p>
              {
                currentPlan.sets
              }
              세트를 모두
              완료했어요.
            </p>
          </div>
        )}

        {completedSets > 0 && (
          <button
            className="reset-exercise-button"
            onClick={
              resetCurrentExercise
            }
          >
            {currentExercise}{" "}
            기록 초기화
          </button>
        )}
      </section>

      {/* 휴식 타이머 */}

      <section className="card timer-card">
        <div className="timer-header">
          <div>
            <p className="label">
              REST TIMER
            </p>

            <h2>
              휴식 타이머
            </h2>
          </div>

          {isTimerRunning && (
            <span className="timer-running">
              휴식 중
            </span>
          )}
        </div>

        <div className="rest-options">
          {[30, 60, 90].map(
            (seconds) => (
              <button
                key={seconds}
                className={
                  restTime ===
                  seconds
                    ? "rest-option active"
                    : "rest-option"
                }
                onClick={() =>
                  changeRestTime(
                    seconds
                  )
                }
              >
                {seconds}초
              </button>
            )
          )}
        </div>

        <div
          className={
            remainingTime === 0
              ? "timer-display finished"
              : "timer-display"
          }
        >
          {remainingTime === 0
            ? "휴식 끝!"
            : formatTime(
                remainingTime
              )}
        </div>

        <div className="timer-buttons">
          {!isTimerRunning ? (
            <button
              className="timer-start-button"
              onClick={() =>
                startTimer()
              }
            >
              {remainingTime === 0
                ? "다시 시작"
                : "타이머 시작"}
            </button>
          ) : (
            <button
              className="timer-pause-button"
              onClick={
                pauseTimer
              }
            >
              일시정지
            </button>
          )}

          <button
            className="timer-reset-button"
            onClick={resetTimer}
          >
            초기화
          </button>
        </div>
      </section>

      {/* 달력 */}

      <section className="card calendar-card">
        <div className="calendar-header">
          <div>
            <p className="label">
              ROUTINE CALENDAR
            </p>

            <h2>
              {calendarYear}년{" "}
              {calendarMonthNumber +
                1}
              월
            </h2>
          </div>

          <div className="calendar-navigation">
            <button
              onClick={
                movePreviousMonth
              }
            >
              ‹
            </button>

            <button
              onClick={
                moveNextMonth
              }
            >
              ›
            </button>
          </div>
        </div>

        <div className="calendar-weekdays">
          {[
            "일",
            "월",
            "화",
            "수",
            "목",
            "금",
            "토",
          ].map((weekday) => (
            <span
              key={weekday}
            >
              {weekday}
            </span>
          ))}
        </div>

        <div className="calendar-grid">
          {calendarCells.map(
            (day, index) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="calendar-empty"
                  />
                );
              }

              const dateKey =
                getDateKey(
                  new Date(
                    calendarYear,
                    calendarMonthNumber,
                    day
                  )
                );

              const status =
                getCalendarStatus(
                  day
                );

              return (
                <div
                  key={dateKey}
                  className={`calendar-day ${status} ${
                    dateKey ===
                    today
                      ? "today"
                      : ""
                  }`}
                >
                  {day}
                </div>
              );
            }
          )}
        </div>

        <div className="calendar-legend">
          <span>
            <i className="legend-dot done" />
            기본 루틴 완료
          </span>

          <span>
            <i className="legend-dot missed" />
            미완료
          </span>
        </div>
      </section>

      {/* 오늘 기록 */}

      <section className="card">
        <div className="record-header">
          <div>
            <p className="label">
              TODAY
            </p>

            <h2>
              오늘 기록
            </h2>
          </div>

          <strong>
            {records.length}
            세트
          </strong>
        </div>

        {workoutSummary.length ===
        0 ? (
          <p className="empty-message">
            아직 완료한 운동이
            없습니다.
          </p>
        ) : (
          <div className="summary-list">
            {workoutSummary.map(
              (item) => (
                <div
                  className="summary-item"
                  key={
                    item.exercise
                  }
                >
                  <div>
                    <strong>
                      {
                        item.exercise
                      }
                    </strong>

                    <p>
                      {item.reps.join(
                        " / "
                      )}
                      회
                    </p>
                  </div>

                  <span>
                    {
                      item.reps
                        .length
                    }
                    세트
                  </span>
                </div>
              )
            )}
          </div>
        )}

        {records.length > 0 && (
          <button
            className="reset-today-button"
            onClick={
              resetToday
            }
          >
            오늘 기록 전체 삭제
          </button>
        )}
      </section>
    </main>
  );
}

export default App;