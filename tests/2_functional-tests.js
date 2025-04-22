const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

const createIssue = (project, issue, done) => {
  chai
    .request(server)
    .post("/api/issues/" + project)
    .send(issue)
    .end(function (err, res) {
      assert.equal(res.status, 201);
      return res.body._id;
    });
};

suite("Functional Tests", function () {
  test("Create an issue with every field", function (done) {
    chai
      .request(server)
      .post("/api/issues/test")
      .send({
        issue_title: "Test Issue",
        issue_text: "This is a test issue",
        created_by: "Tester",
        assigned_to: "Assignee",
        status_text: "In Progress",
      })
      .end(function (err, res) {
        assert.equal(res.status, 201);
        assert.property(res.body, "_id");
        assert.equal(res.body.issue_title, "Test Issue");
        assert.equal(res.body.issue_text, "This is a test issue");
        assert.equal(res.body.created_by, "Tester");
        assert.equal(res.body.assigned_to, "Assignee");
        assert.equal(res.body.status_text, "In Progress");
        done();
      });
  });

  test("Create an issue with required fields only", function (done) {
    chai
      .request(server)
      .post("/api/issues/test")
      .send({
        issue_title: "Test Issue",
        issue_text: "This is a test issue",
        created_by: "Tester",
      })
      .end(function (err, res) {
        assert.equal(res.status, 201);
        assert.property(res.body, "_id");
        assert.equal(res.body.issue_title, "Test Issue");
        assert.equal(res.body.issue_text, "This is a test issue");
        assert.equal(res.body.created_by, "Tester");
        assert.equal(res.body.assigned_to, "");
        assert.equal(res.body.status_text, "");
        done();
      });
  });

  test("Create an issue with missing required fields", function (done) {
    chai
      .request(server)
      .post("/api/issues/test")
      .send({
        issue_text: "This is a test issue",
        created_by: "Tester",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "required field(s) missing");
        done();
      });
  });

  test("View issues on a project", function (done) {
    chai
      .request(server)
      .get("/api/issues/test")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test("View issues on a project with one filter", function (done) {
    chai
      .request(server)
      .get("/api/issues/test")
      .query({ open: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test("View issues on a project with multiple filters", function (done) {
    chai
      .request(server)
      .get("/api/issues/test")
      .query({ open: true, assigned_to: "Assignee" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  test("Update one field on an issue", function (done) {
    chai
      .request(server)
      .post("/api/issues/test")
      .send({
        issue_title: "Test Issue",
        issue_text: "This is a test issue",
        created_by: "Tester",
        assigned_to: "Assignee",
        status_text: "In Progress",
      })
      .then((post) => {
        chai
          .request(server)
          .put("/api/issues/test")
          .send({ _id: post.body._id, issue_title: "Updated Title" })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully updated");
            assert.equal(res.body._id, post.body._id);
            done();
          });
      });
  });

  test("Update multiple fields on an issue", function (done) {
    chai
      .request(server)
      .post("/api/issues/test")
      .send({
        issue_title: "Test Issue",
        issue_text: "This is a test issue",
        created_by: "Tester",
        assigned_to: "Assignee",
        status_text: "In Progress",
      })
      .then((post) => {
        chai
          .request(server)
          .put("/api/issues/test")
          .send({
            _id: post.body._id,
            issue_title: "Updated Title",
            issue_text: "Updated text",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully updated");
            assert.equal(res.body._id, post.body._id);
            done();
          });
      });
  });

  test("Update an issue with missing _id", function (done) {
    chai
      .request(server)
      .put("/api/issues/test")
      .send({ issue_title: "Updated Title" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });

  test("Update an issue with no fields to update", function (done) {
    chai
      .request(server)
      .put("/api/issues/test")
      .send({ _id: "some_id" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "no update field(s) sent");
        done();
      });
  });

  test("Update an issue with an invalid _id", function (done) {
    chai
      .request(server)
      .put("/api/issues/test")
      .send({ _id: "invalid_id", issue_title: "Updated Title" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "could not update");
        done();
      });
  });

  test("Delete an issue", function (done) {
    chai
      .request(server)
      .post("/api/issues/test")
      .send({
        issue_title: "Test Issue",
        issue_text: "This is a test issue",
        created_by: "Tester",
        assigned_to: "Assignee",
        status_text: "In Progress",
      })
      .then((post) => {
        chai
          .request(server)
          .delete("/api/issues/test")
          .send({ _id: post.body._id })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully deleted");
            assert.equal(res.body._id, post.body._id);
            done();
          });
      });
  });

  test("Delete an issue with invalid _id", function (done) {
    chai
      .request(server)
      .delete("/api/issues/test")
      .send({
        _id: "invalid_id",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "could not delete");
        done();
      });
  });

  test("Delete an issue with missing _id", function (done) {
    chai
      .request(server)
      .delete("/api/issues/test")
      .send({})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });
});
