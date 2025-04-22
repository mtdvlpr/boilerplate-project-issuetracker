"use strict";

const crypto = require("crypto");

const issues = new Map();

const generateId = () => {
  return crypto.randomBytes(16).toString("hex");
};

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;
      let projectIssues = issues.get(project) || [];
      Object.keys(req.query).forEach((key) => {
        projectIssues = projectIssues.filter((issue) => {
          return (
            issue[key].toString().toLowerCase() ===
            req.query[key].toString().toLowerCase()
          );
        });
      });

      return res.status(200).json(projectIssues);
    })

    .post(function (req, res) {
      let project = req.params.project;
      const requiredFields = ["issue_title", "issue_text", "created_by"];
      if (!requiredFields.every((field) => !!req.body[field])) {
        return res.status(200).json({ error: "required field(s) missing" });
      }

      const newIssue = {
        _id: generateId(),
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: new Date(),
        updated_on: new Date(),
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        status_text: req.body.status_text || "",
        open: true,
      };

      const projectIssues = issues.get(project) || [];
      projectIssues.push(newIssue);
      issues.set(project, projectIssues);
      return res.status(201).json(newIssue);
    })

    .put(function (req, res) {
      let project = req.params.project;
      if (!req.body._id) return res.status(200).json({ error: "missing _id" });
      if (Object.keys(req.body).length === 1) {
        return res
          .status(200)
          .json({ error: "no update field(s) sent", _id: req.body._id });
      }

      const projectIssues = issues.get(project) || [];
      const issue = projectIssues.find((i) => i._id === req.body._id);
      if (!issue) {
        return res
          .status(200)
          .json({ error: "could not update", _id: req.body._id });
      }

      const newIssue = {
        ...issue,
        ...req.body,
        updated_on: new Date(),
      };

      const index = projectIssues.indexOf(issue);
      projectIssues[index] = newIssue;
      issues.set(project, projectIssues);
      return res
        .status(200)
        .json({ result: "successfully updated", _id: req.body._id });
    })

    .delete(function (req, res) {
      let project = req.params.project;
      if (!req.body._id) return res.status(200).json({ error: "missing _id" });
      const projectIssues = issues.get(project) || [];
      const match = projectIssues.find((i) => i._id === req.body._id);
      if (!match) {
        return res
          .status(200)
          .json({ error: "could not delete", _id: req.body._id });
      }

      const index = projectIssues.indexOf(match);
      projectIssues.splice(index, 1);
      issues.set(project, projectIssues);
      return res
        .status(200)
        .json({ result: "successfully deleted", _id: req.body._id });
    });
};
